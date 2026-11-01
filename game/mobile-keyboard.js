// A readonly mobile parser keeps the OS keyboard (and its viewport pan) closed.
// Real keyboard events still edit the same command field and submit the same form.
function installMobileKeyboard(field,form,shell){
 let symbols=false;
 const panel=document.createElement('div');panel.id='mobile-keyboard';panel.className='mobile-keyboard';panel.hidden=true;
 panel.setAttribute('role','group');panel.setAttribute('aria-label','Game command keyboard');
 field.readOnly=true;field.inputMode='none';field.setAttribute('aria-controls',panel.id);field.setAttribute('aria-expanded','false');
 const hide=()=>{panel.hidden=true;shell.classList.remove('mobile-keyboard-open');field.setAttribute('aria-expanded','false');field.blur()};
 const edit=(value)=>{
  let start=field.selectionStart??field.value.length,end=field.selectionEnd??start;
  if(value==='Backspace'){if(start===end)start=Math.max(0,start-1);value=''}
  const next=(field.value.slice(0,start)+value+field.value.slice(end)).slice(0,field.maxLength);
  field.value=next;const caret=Math.min(start+value.length,next.length);field.setSelectionRange(caret,caret);
  field.dispatchEvent(new Event('input',{bubbles:true}));
 };
 const key=(row,label,action,wide=false)=>{
  const button=document.createElement('button');button.type='button';button.textContent=label;
  if(wide)button.className='wide-key';
  button.setAttribute('aria-label',label==='⌫'?'Backspace':label);
  // Keep the command caret when tapping a key; never summon the OS keyboard.
  button.addEventListener('pointerdown',event=>event.preventDefault());button.addEventListener('click',action);row.append(button);
 };
 const paint=()=>{
  panel.replaceChildren();
  const rows=symbols?['1234567890',"-/:;()&@'",'.,?!"']:['qwertyuiop','asdfghjkl','zxcvbnm'];
  rows.forEach((letters,index)=>{const row=document.createElement('div');row.className='keyboard-row';
   for(const letter of letters)key(row,letter.toUpperCase(),()=>edit(letter));
   if(index===2)key(row,'⌫',()=>edit('Backspace'),true);panel.append(row);
  });
  const row=document.createElement('div');row.className='keyboard-row';
  key(row,symbols?'ABC':'123',()=>{symbols=!symbols;paint()});key(row,'Space',()=>edit(' '),true);
  key(row,'Enter',()=>form.requestSubmit(),true);key(row,'Hide',hide);panel.append(row);
 };
 const show=()=>{panel.hidden=false;shell.classList.add('mobile-keyboard-open');field.setAttribute('aria-expanded','true')};
 paint();shell.append(panel);field.addEventListener('focus',show);field.addEventListener('click',show);
 field.addEventListener('keydown',event=>{
  if(event.ctrlKey||event.metaKey||event.altKey||event.isComposing)return;
  if(event.key.length===1||['Backspace','Enter','Escape'].includes(event.key)){
   event.preventDefault();event.stopImmediatePropagation();
   if(event.key==='Enter')form.requestSubmit();else if(event.key==='Escape')hide();else edit(event.key);
  }
 });
 form.addEventListener('submit',hide);
 return{hide,show};
}
