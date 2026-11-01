// Original 24-bar 6/8 miniature: The Song the Glass Kept.
// Four bars per scene. One continuous score, three monophonic PSG parts.
const prologueScore={title:'The Song the Glass Kept',tickSeconds:.28,bars:24,sceneFrames:48,frameSeconds:.14};
const prologueMelodyBars=[
 [[62,2],[65,1],[69,2],[67,1]],[[65,2],[64,1],[62,3]],
 [[60,2],[62,1],[65,2],[64,1]],[[62,4],[0,2]],
 [[62,2],[65,1],[69,2],[72,1]],[[71,2],[69,1],[67,3]],
 [[65,2],[67,1],[64,2],[60,1]],[[62,3],[69,2],[0,1]],
 [[74,2],[77,1],[81,2],[79,1]],[[77,2],[76,1],[74,3]],
 [[72,2],[74,1],[77,2],[76,1]],[[73,3],[0,1],[76,2]],
 [[74,1],[72,1],[69,2],[67,2]],[[65,1],[64,1],[62,2],[61,2]],
 [[62,1],[65,1],[69,1],[73,1],[76,1],[0,1]],[[81,1],[79,1],[77,1],[76,1],[73,1],[0,1]],
 [[86,1],[0,1],[81,1],[0,1],[77,2]],[[0,2],[76,1],[74,3]],
 [[0,3],[69,1],[65,2]],[[64,2],[61,2],[0,2]],
 [[62,2],[65,1],[69,2],[67,1]],[[65,2],[64,1],[62,3]],
 [[60,2],[65,1],[64,2],[61,1]],[[62,4],[0,2]]
];
const prologueRoots=[50,50,48,50,50,45,48,50,50,48,45,49,50,49,45,49,50,45,50,49,50,50,48,50];
const prologueMiddle=prologueRoots.flatMap((root,i)=>{
 if(i<8){const third=root+(root===50?15:16);return [[root+12,1],[third,1],[root+19,1],[third,1],[root+12,1],[0,1]]}
 if(i<12)return [[0,2],[root+12,1],[root+19,1],[root+15,2]];
 if(i<16)return [[root+12,1],[root+15,1],[root+19,1],[root+15,1],[root+12,1],[0,1]];
 if(i<20)return [[root+19,2],[0,1],[root+12,2],[0,1]];
 return [[root+12,2],[root+15,1],[root+19,2],[0,1]];
});
tandyCues.prologueStory=[
 prologueMelodyBars.flat(),prologueMiddle,
 prologueRoots.flatMap((root,i)=>[[root,i<16?3:4],[i===23?0:root+7,i<16?2:1],[0,1]])
].map(voice=>voice.map(([note,ticks])=>[note,ticks*prologueScore.tickSeconds]));
