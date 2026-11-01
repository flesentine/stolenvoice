# Enumerate every valid inlet-to-bucket layout for this fixed stock of troughs.
# Reverse multi-source BFS then finds a reachable starting board whose distance
# to ANY solution is known exactly. Identical troughs and both gaps share IDs.
# Run from the repository root; output is a design-time artifact, not game code.
from collections import Counter,deque
import json,time
ports={1:(0,2),2:(1,3),3:(0,1),4:(1,2),5:(2,3),6:(0,3)}
kind={tuple(sorted(v)):k for k,v in ports.items()}
goal='5450111711103632'
stock=Counter(map(int,goal));del stock[0];del stock[7]
neighbors=[[j for j in (i-4,i+1 if i%4<3 else -1,i+4,i-1 if i%4 else -1) if 0<=j<16 and j!=7] for i in range(16)]
goals=set()
def paths(i,entry,path,board,left):
 if i in path or i==7:return
 for exit in range(4):
  if exit==entry:continue
  tile=kind[tuple(sorted((entry,exit)))]
  if not left[tile]:continue
  nr=i//4+(-1,0,1,0)[exit];nc=i%4+(0,1,0,-1)[exit]
  b=board[:];b[i]=str(tile);remain=left.copy();remain[tile]-=1
  if not(0<=nr<4 and 0<=nc<4):
   if i==15 and exit==1:
    slots=[n for n,v in enumerate(b) if v=='0'];rest=remain.copy();rest[0]=2
    def complete(k):
     if k==len(slots):goals.add(''.join(b));return
     for value,count in list(rest.items()):
      if count:
       rest[value]-=1;b[slots[k]]=str(value);complete(k+1);rest[value]+=1
     b[slots[k]]='0'
    complete(0)
  else:paths(nr*4+nc,(exit+2)%4,path+[i],b,remain)
b=['0']*16;b[7]='7';paths(0,3,[],b,stock)
print('goals',len(goals),flush=True)
assert goal in goals
seen={s:(None,None,0) for s in sorted(goals)};queue=deque(sorted(goals));best=goal;start=time.time()
while queue and len(seen)<1800000:
 s=queue.popleft();depth=seen[s][2]
 if depth>seen[best][2]:best=s;print('depth',depth,'states',len(seen),flush=True)
 if depth>=16:best=s;break
 for hole in [i for i,c in enumerate(s) if c=='0']:
  for j in neighbors[hole]:
   if s[j] in '07':continue
   v=list(s);v[hole],v[j]=v[j],v[hole];n=''.join(v)
   if n not in seen:seen[n]=(s,(hole,j),depth+1);queue.append(n)
# Following predecessors solves by moving tile at hole into its previous location j.
moves=[];s=best
while seen[s][0] is not None:
 parent,move,d=seen[s];moves.append({'from':move[0],'to':move[1]});s=parent
out={'initial':list(map(int,best)),'solved':list(map(int,s)),'minimumMoves':seen[best][2],'solution':moves,'goalCount':len(goals),'searchedStates':len(seen),'seconds':round(time.time()-start,3)}
open('assets/sluice-sliding-design.json','w').write(json.dumps(out,indent=2)+'\n');print(out,flush=True)
