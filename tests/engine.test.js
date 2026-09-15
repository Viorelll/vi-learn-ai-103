import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {blocks,selectQuestions,grade,summarize,elapsed,duration,isAnswered} from '../src/engine.js';
const bank=JSON.parse(readFileSync(new URL('../src/data/questions.json',import.meta.url)));
test('all 135 source questions have valid, renderable controls and keys',()=>{
 assert.deepEqual(bank.map(q=>q.id),Array.from({length:135},(_,i)=>i+1));
 for(const q of bank){assert.ok(q.prompt);for(const basis of ['original','reviewed']){const key=q[basis];if(!key)continue;assert.equal(key.length,q.fields.length||key.length);key.forEach((k,i)=>{if(k===null)return;assert.ok(q.fields.length?q.fields[i].options[k]:q.options.some(o=>o.id===k),`${q.id}/${basis}/${k}`)});const answer=q.fields.length?Object.fromEntries(key.map((k,i)=>[i,k])):key;assert.equal(grade(q,answer,basis).status,'correct');assert.equal(grade(q,undefined,basis).earned,0)}}
});
test('10, 15, 20 and 30 blocks cover the bank once with correct tails',()=>{for(const size of [10,15,20,30]){const all=blocks(size).flatMap(b=>selectQuestions({mode:'blocks',block:b.start,size}));assert.deepEqual(all,bank.map(q=>q.id));}assert.deepEqual(blocks(15)[1],{start:16,end:30});assert.deepEqual(blocks(10).at(-1),{start:131,end:135})});
test('random mode samples without repeats and full mode is sequential',()=>{for(const size of [10,15,20,30]){const ids=selectQuestions({mode:'random',size});assert.equal(ids.length,size);assert.equal(new Set(ids).size,size);assert.ok(ids.every(n=>n>=1&&n<=135))}assert.deepEqual(selectQuestions({mode:'all'}),bank.map(q=>q.id))});
test('custom ranges validate input and include both bounds',()=>{assert.deepEqual(selectQuestions({mode:'custom',start:131,end:135}),[131,132,133,134,135]);for(const [start,end] of [[0,10],[10,9],[1,136],[1.5,10]])assert.throws(()=>selectQuestions({mode:'custom',start,end}))});
test('checkbox scoring requires exact selections independent of order',()=>{const q=bank[32];assert.equal(grade(q,['C','B']).earned,1);assert.equal(grade(q,['B']).earned,0);assert.equal(grade(q,['A','B','C']).earned,0)});
test('matching and matrix allow partial credit; missing statements excluded',()=>{assert.deepEqual(grade(bank[4],{0:3,1:2}),{status:'partial',earned:1,possible:2});assert.equal(grade(bank[100],{0:0,1:0,2:0}).possible,2);assert.equal(grade(bank[100],{0:0,1:0,2:1}).earned,2)});
test('source conflicts use the selected key, missing keys never silently fall back',()=>{assert.equal(grade(bank[1],['B'],'original').status,'correct');assert.equal(grade(bank[1],['B'],'reviewed').status,'incorrect');assert.equal(grade(bank[3],{0:1,1:0,2:1},'original').status,'ungraded');assert.equal(grade(bank[65],{}).status,'ungraded');assert.equal(summarize([bank[65],bank[67]],{},'reviewed').percent,null)});
test('timer excludes paused periods and supports hours',()=>{assert.equal(elapsed({elapsed:6000,runningSince:1000},4000),9000);assert.equal(elapsed({elapsed:6000,runningSince:null},90000),6000);assert.equal(duration(3661000),'01:01:01');assert.equal(duration(59000),'00:59')});
test('completion recognizes index zero, incomplete answers and study-only items',()=>{assert.equal(isAnswered(bank[0],{0:0,1:1}),true);assert.equal(isAnswered(bank[0],{0:0}),false);assert.equal(isAnswered(bank[1],[]),false);assert.equal(isAnswered(bank[65],{}),false)});
