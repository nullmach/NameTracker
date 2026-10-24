import test from 'node:test';
import assert from 'node:assert/strict';
import {matches,validateBackup} from '../src/model.js';
const ivy=['Ivy','F',1500,40,2025,1500,10000],rare=['Fern','F',50,2000,1920,900,30000],old=['Abbie','F',0,0,1900,200,5000];
test('both likes and passes disappear from all discovery collections',()=>{
  for(const decision of ['like','pass'])for(const theme of ['all','nature','short','popular'])assert.equal(matches(ivy,{theme},{'Ivy-F':decision}),false);
});
test('sex, search and collections combine',()=>{
  assert.equal(matches(ivy,{sex:'F',theme:'nature',query:' IV '}),true);
  assert.equal(matches(ivy,{sex:'M'}),false);
  assert.equal(matches(rare,{theme:'rare'}),true);
  assert.equal(matches(ivy,{theme:'rare'}),false);
  assert.equal(matches(old,{theme:'all'}),false);
  assert.equal(matches(old,{theme:'historic'}),true);
});
test('backup import validates version and ignores unknown names or decisions',()=>{
  assert.deepEqual(validateBackup({version:1,decisions:{'Ivy-F':'like','bad':'like','Fern-F':'oops'}},new Set(['Ivy-F','Fern-F'])),{'Ivy-F':'like'});
  assert.throws(()=>validateBackup({version:2,decisions:{}},new Set()));
  assert.throws(()=>validateBackup({version:1,decisions:[]},new Set()));
});
