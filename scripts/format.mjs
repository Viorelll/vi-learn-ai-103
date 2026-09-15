import fs from 'node:fs';
import parser from '@babel/parser';
import generator from '@babel/generator';
import postcss from 'postcss';
for(const path of ['src/App.jsx','src/Dashboard.jsx','src/Question.jsx','src/engine.js','src/main.jsx','vite.config.js']){
 const ast=parser.parse(fs.readFileSync(path,'utf8'),{sourceType:'module',plugins:['jsx']});
 fs.writeFileSync(path,generator.default(ast,{comments:true}).code+'\n');
}
const path='src/styles.css',root=postcss.parse(fs.readFileSync(path,'utf8'));
root.walk(node=>{let depth=0,parent=node.parent;while(parent&&parent.type!=='root'){depth++;parent=parent.parent}const indent='  '.repeat(depth);node.raws.before='\n'+indent;if(node.type==='decl'){node.raws.between=': '}else if(node.nodes){node.raws.between=' ';node.raws.after='\n'+indent;node.raws.semicolon=true}});
fs.writeFileSync(path,root.toString().trim()+'\n');
