import test from 'node:test';
import assert from 'node:assert/strict';
import {attachSwipe} from '../src/swipe.js';

function setup() {
  const listeners={},choices=[],styles=new Map(),classes=new Set();
  let captured=false;
  const card={clientWidth:350,classList:{add:(...v)=>v.forEach(x=>classes.add(x)),remove:(...v)=>v.forEach(x=>classes.delete(x)),toggle:(v,on)=>on?classes.add(v):classes.delete(v)},style:{setProperty:(k,v)=>styles.set(k,v),removeProperty:k=>styles.delete(k)}};
  const host={dataset:{},addEventListener:(event,fn)=>listeners[event]=fn,removeAttribute:()=>delete host.dataset.direction,hasPointerCapture:()=>captured,setPointerCapture:()=>captured=true,releasePointerCapture:()=>captured=false};
  globalThis.window={addEventListener:()=>{}};
  globalThis.matchMedia=()=>({matches:false});
  const reset=attachSwipe(host,v=>choices.push(v),()=>true);
  const event=(type,x,y=0,extra={})=>listeners[type]({isPrimary:true,button:0,pointerId:1,clientX:x,clientY:y,target:{closest:s=>s==='.name-card'?card:null},...extra});
  return {event,choices,styles,classes,host,reset};
}
test('right and left swipes give matching feedback and exactly one decision',()=>{
  for(const [distance,value] of [[110,'like'],[-110,'pass']]){
    const s=setup();s.event('pointerdown',0);s.event('pointermove',distance);
    assert.equal(s.host.dataset.direction,value);
    assert.equal(s.styles.get(value==='like'?'--love':'--pass'),1);
    assert.ok(s.classes.has('swipe-ready'));
    s.event('pointerup',distance);s.event('pointerup',distance);
    assert.deepEqual(s.choices,[value]);
  }
});
test('short drags, vertical scrolling and cancelled gestures never choose a name',()=>{
  for(const mode of ['short','vertical','cancel','reset']){
    const s=setup();s.event('pointerdown',0);
    s.event('pointermove',mode==='short'?30:110,mode==='vertical'?160:0);
    if(mode==='cancel')s.event('pointercancel',110);
    if(mode==='reset')s.reset();
    s.event('pointerup',110);
    assert.deepEqual(s.choices,[]);
    assert.equal(s.host.dataset.direction,undefined);
    assert.ok(!s.classes.has('dragging'));
  }
});
test('finger swipes prevent horizontal scrolling and ignore browser pointer cancellation',()=>{
  for(const [dx,decision] of [[110,'like'],[-110,'pass']]){
    const s=setup();let prevented=false;
    const touch=(x,y=0)=>({identifier:7,clientX:x,clientY:y});
    s.event('pointerdown',0,0,{pointerType:'touch'});
    s.event('touchstart',0,0,{touches:[touch(0)]});
    s.event('touchmove',0,0,{touches:[touch(dx,12)],cancelable:true,preventDefault:()=>prevented=true});
    s.event('pointercancel',dx,12,{pointerType:'touch'});
    assert.equal(s.host.dataset.direction,decision);
    assert.equal(prevented,true);
    s.event('touchend',0,0,{changedTouches:[touch(dx,12)]});
    s.event('pointerup',dx,12,{pointerType:'touch'});
    assert.deepEqual(s.choices,[decision]);
  }
});
test('vertical touch scrolling, multi-touch and touch cancellation never make choices',()=>{
  for(const mode of ['vertical','multi','cancel','short']){
    const s=setup();let prevented=false;
    const touch=(x,y=0)=>({identifier:7,clientX:x,clientY:y});
    s.event('touchstart',0,0,{touches:[touch(0)]});
    const touches=mode==='multi'?[touch(100),{...touch(120),identifier:8}]:[touch(mode==='short'?20:100,mode==='vertical'?150:0)];
    s.event('touchmove',0,0,{touches,cancelable:true,preventDefault:()=>prevented=true});
    if(mode==='cancel')s.event('touchcancel',0);
    s.event('touchend',0,0,{changedTouches:[touch(100)]});
    assert.deepEqual(s.choices,[]);
    if(['vertical','multi'].includes(mode))assert.equal(prevented,false);
  }
});
