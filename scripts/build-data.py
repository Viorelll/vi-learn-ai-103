import json,re
from pathlib import Path
qs=json.load(open('tmp/pdfs/extracted.json',encoding='utf-8'))
ocr=json.load(open('tmp/pdfs/ocr.json',encoding='utf-8-sig'))
D={}
def fields(n,kind,rows,keys,original=None):
 D[n]=dict(type=kind,fields=[dict(label=l,options=o.split('|')) for l,o in rows],reviewed=keys,original=original if original is not None else keys)
def match(n,labels,options,keys,kind='matching'):
 fields(n,kind,[(l,options) for l in labels],keys)
def matrix(n,labels,keys):
 fields(n,'matrix',[(l,'Yes|No') for l in labels],keys)
fields(1,'dropdown',[('Deployment type','Standard|Global Standard|Global Provisioned'),('Version update policy','Once the current version expires|Opt out of automatic model version upgrades|Upgrade once new default version becomes available')],[0,1])
matrix(4,['The LangChain service will appear in Traces without configuring a tracer.','Setting different OTEL_SERVICE_NAME values separates the services in Application Insights.','When using enable_content_recording=False, prompts and tool data will be captured in the telemetry.'],[1,0,1]); D[4]['original']=None
match(5,['Pipeline1','Pipeline2'],'Multi-file task in pro mode|Multi-file task in standard mode|Single-file task in pro mode|Single-file task in standard mode',[3,0])
fields(6,'dropdown',[('credential','AzureKeyCredential|ClientSecretCredential|DefaultAzureCredential'),('openai_client.responses method','compact|create|retrieve')],[2,1])
fields(7,'dropdown',[('If/else condition expression','IsBlank(Local.Var01)|IsEmpty(Local.Var01)|Not(IsBlank(Local.Var01))'),('Send message expression','{Local.Var01}|{Upper(Local.Var01)}|{Upper(Var01)}')],[2,1])
fields(8,'dropdown',[('Guardrails','Select Tool call and set Action to Block.|Select User input and Output and set Action to Annotate.|Select User input and Tool response and set Action to Annotate.|Select User input, Output, Tool response, and Tool call and set Action to Block.'),('Storage access','Storage account access keys|A user-assigned identity assigned the Storage Queue Data Contributor role|A system-assigned managed identity assigned the Storage Blob Data Reader role|A system-assigned managed identity assigned the Storage Blob Data Contributor role')],[3,3],[3,2])
fields(11,'dropdown',[('Approval step type','ask_question|basic_chat|data_transformation'),('Execute refund condition','approval == "approved"|propose_refund.output != null|true')],[0,0])
match(15,['Unsupported responses','Policy violations'],'Groundedness evaluation metrics|Latency breakdown traces|Risk and safety metrics|Token usage analytics',[0,2])
fields(18,'dropdown',[('Metrics to enable','Model Availability Rate and Provisioned Utilization|Only Tokens Cache Match Rate|Only Total Requests filtered to status code 200|Time To Response and Total Tokens'),('Diagnostic log to collect','AllMetrics|audit|RequestResponse|trace')],[0,2])
fields(20,'dropdown',[('Set tool_choice to','auto|none|required'),('Configure the tool to authenticate by','Storing API keys in prompts|Using the shared project agent identity|Using a distinct agent identity bound to the client application')],[2,2])
match(30,['Parameter name','Parameter value'],'auto|required|response_format|tool_choice|tools|type',[3,1])
match(32,['Access up-to-date information from public websites','Perform calculations during conversations','Retrieve information from documents uploaded directly to the agent'],'Code interpreter|Computer use|File search|Grounding with Bing Search|Microsoft Fabric',[3,0,2])
fields(35,'dropdown',[('temperature','0|1|2'),('output_config effort','high|low|medium')],[0,0])
fields(37,'dropdown',[('Retain user preferences across conversations','Agent memory that uses persistent storage|Conversation history|Orchestration-managed session context'),('Provide contextual grounding during chats','Azure AI Search tool|Code interpreter tool|File search tool')],[0,2])
fields(40,'dropdown',[('Authentication method','A personal access token (PAT)|A user-assigned managed identity|An Azure Login action that uses OpenID Connect (OIDC)'),('If evaluation results are NOT met, configure the workflow to','Lock the target branch|Send an alert|Fail')],[2,2])
fields(49,'dropdown',[('Prompt shields action','Disable the shield.|Set action to block.|Set action to annotate.'),('Additional mitigation','Enable Spotlighting.|Create a custom blocklist.|Use optical character recognition (OCR) to extract the text from the images first.')],[1,0])
for n in [66,68]: D[n]=dict(type='unavailable',fields=[],reviewed=None,original=None)
fields(71,'dropdown',[('Responses supported by provided context and addressing the user query','Coherence and Fluency|GPT similarity and F1 score|Groundedness and Relevance|Groundedness and ROUGE score'),('Sensitive or proprietary information','Hateful and unfair content|Indirect attack|Protected material|Violent content')],[2,2])
match(77,['MemorySearchTool scope','PromptAgentDefinition tools'],'"session"|"{{$conversationId}}"|"{{$userId}}"|[mem_store_name]|[memory_tool]|MemorySearchTool("support_mem_store")',[2,4])
fields(79,'dropdown',[('Orchestration pattern','The sequential template that passes outputs node by node|The group chat template to dynamically route control between the agents|The human-in-the-loop template that pauses execution of the workflow for input'),('Approval checkpoints','Add a Basic chat node.|Add a Condition statement.|Add an Ask a question node.')],[0,2])
match(86,['Field value type','Field method'],'classify|generate|group|string|table',[3,1])
fields(92,'dropdown',[('Managed identity scope','Enable a system-assigned managed identity at the Foundry level.|Enable a system-assigned managed identity at the project level.|Create a service principal and store the principal’s client secret.'),('Key Vault authorization method','Add an API key to application settings.|Add a Key Vault access policy for the secrets.|Assign the Key Vault Secrets User role to the managed identity.')],[1,2])
matrix(93,['Changing the content filtering configuration to low severity will resolve the fine-tuning job issues.','The difference between the 12% and 4% content harm defect rate is consistent with the different severity thresholds used in Run1 and Run2.','The identical 6% protected material evaluation values across Run1 and Run2 indicate that this metric is unaffected by the change in the severity threshold.'],[1,0,0])
match(94,['Capture all nested operations across the entire agent run','Record tool invocation arguments and results'],'Hierarchical spans|A KQL query filter|Sampling|Tool call attributes|Trace sampling policy',[0,3])
match(95,['HTTP 429','HTTP 400'],'Increase tenant-wide quotas.|Move large content to files and use file search.|Use additional agent tools to reduce the message size.|Implement exponential backoff and jitter in the retry logic.|Split content into smaller files before uploading the files.',[3,4])
fields(98,'dropdown',[('category','AzureAIServices|AzureKeyVault|AzureOpenAI'),('authType','AccountKey|AccountManagedIdentity|ApiKey')],[1,1])
fields(99,'dropdown',[('Knowledge grounding','Configure retrieval from approved data sources.|Upload the policy documents directly to the agent.|Embed the policy documents directly into the agent instructions.'),('Memory','Use orchestration-managed session context.|Enable agent memory that uses persistent storage.|Retain user preferences in the state of the client application.')],[0,1])
matrix(101,['The code will display the name of each detected brand with a confidence equal to or higher than 75 percent.','The code will display coordinates for the top-left corner of the rectangle that contains the brand logo of the displayed brands.','The code will display coordinates for the bottom-right corner of the rectangle that contains the brand logo of the displayed brands.'],[0,0,None])
fields(103,'dropdown',[('Resource kind','AIServices|LanguageAuthoring|OpenAI'),('Encryption parameter','--api-properties|--assign-identity|--encryption')],[2,2])
fields(104,'dropdown',[('request','AnalyzeTextOptions(categories=comment)|AnalyzeTextOptions(text=[comment])|AnalyzeTextOptions(text=comment)|TextCategory.SELF_HARM(comment)'),('response','client.analyze_image(request)|client.analyze_text(request)|client.moderate_text(request)|client.path("text/analyze").post(request)')],[2,1])
matrix(107,['For sample_text, result will include entity records for Contact and SSN.','For sample_text, text_for_model will include john.doe@contoso.com and 859-98-0987.','For sample_text, text_for_model will contain entity-type masks for John Doe and 312-555-1234.'],[1,0,0]);D[107]['original']=None
match(108,['Step 1','Step 2','Step 3'],'Initialize the training dataset.|Train the classifier model.|Create a project.|Upload and tag images.|Train the object detection model.',[2,3,1],'ordering')
match(112,['Step 1','Step 2','Step 3'],'Regenerate the primary admin key|Regenerate the secondary admin key|Change the app to use the secondary admin key|Add a new query key|Change the app to use the new key|Delete the compromised key',[3,4,5],'ordering')
fields(113,'dropdown',[('HTTP method','PATCH|POST|PUT'),('kind','CognitiveServices|ComputerVision|TextAnalytics')],[2,0])
fields(114,'dropdown',[('Percentage of false positives','0|25|30|50|100'),('True positives / (true positives + false negatives), as a percentage','0|25|30|50|100')],[0,1]);D[114]['original']=None
fields(117,'dropdown',[('JSON data','File projection|Object projection|Table projection'),('Extracted text data','File projection|Object projection|Table projection')],[1,1])
fields(118,'dropdown',[('Project Types','Classification|Object Detection'),('Classification Types','Multiclass (Single tag per image)|Multilabel (Multiple tags per image)'),('Domains','Adult|Food|General|General (compact)|Landmarks|Landmarks (compact)|Retail|Retail (compact)')],[0,0,3])
matrix(121,['The code will detect the language of documents.','The url attribute returned for each linked entity will be a Bing search link.','The matches attribute returned for each linked entity will provide the location in a document where the entity is referenced.'],[1,1,0])
fields(122,'dropdown',[('Model evaluation','Configure private endpoint access.|Use deployment lists and license tabs.|Use tool catalog connections and run traces.|Use model catalog leaderboards and model cards.'),('Deployment option','Bring your own model.|Build a vector index.|Use a serverless deployment.|Use a managed compute deployment.')],[3,2])
matrix(124,['The response will contain an explanation of large language models (LLMs) that has a high degree of certainty.','Changing "What is an LLM?" to "What is an LLM in the context of AI models?" will produce the intended response.','Changing "You are a helpful assistant." to "You must answer only within the context of AI language models." will give a higher likelihood of producing the intended response.'],[1,0,None])
fields(128,'dropdown',[('Extract text','Azure AI Search|Azure Vision in Foundry Tools|Azure Document Intelligence in Foundry Tools'),('Perform sentiment analysis','Azure AI Search|Azure AI Computer Vision|Azure Document Intelligence in Foundry Tools|Azure Language in Foundry Tools')],[2,3]);D[128]['original']=None
matrix(130,['Going to http://localhost:5000/status will query the Azure endpoint to verify whether the API key used to start the container is valid.','The container logging provider will write log data.','Going to http://localhost:5000/swagger will provide the details to access the documentation for the available endpoints.'],[1,1,0])
match(133,['Step 1','Step 2','Step 3'],'Pull an image from Docker Hub.|Run the container and specify an API key and the Endpoint URL of the Azure AI resource.|Provision an on-premises Kubernetes cluster that is isolated from the internet.|Provision an on-premises Kubernetes cluster that has internet connectivity.|Provision an Azure Kubernetes Service (AKS) resource.|Run the container and specify an App ID and Client Secret.|Pull an image from the Microsoft Container Registry (MCR).',[3,6,1],'ordering')
fields(134,'dropdown',[('HTTP method','GET|PATCH|POST'),('visualFeatures','description|imageType|objects|tags')],[2,1])
# Exact option transcription for image-based choice questions.
choices={9:['a workflow','threads and runs without a workflow','a multi-agent group chat session','separate agent runs coordinated in the application code'],14:['tool_choice={"required"}','tool_choice={"auto"}','tool_choice={"type":"knowledge_base"}','tool_choice={"type":"mcp"}'],119:['Add the response_format parameter to the create_and_process() method call.','Replace create_and_process() method with the create_thread_and_process_run() method.','Add the toolset parameter to the create_and_process() method call.','Add the tool_choice parameter to the create_and_process() method call.'],120:['London and Buckingham Palace only','Tour and visit only','Our tour of London included a visit to Buckingham Palace','London and Tour only']}
result=[]
for q in qs:
 t=q['text'].replace('\x00',''); source=t.split('ANSWER -',1)[1].split('Comments',1)[0].strip()
 original_section=source.split('OPENAI-GENERATED STUDY ANSWER')[0]
 orig=re.match(r'([A-F]+)\s',source)
 origkeys=list(orig[1]) if orig else None
 review=re.search(r'OPENAI-GENERATED STUDY ANSWER\s+OpenAI confidence: (\w+)\s+Answer\s+(.*?)\s+Why\s+(.*?)\s+Generated by OpenAI',t,re.S)
 reviewtext=review[2].strip() if review else ''
 rationale=review[3].strip() if review else ''
 keys=origkeys
 if review and origkeys:
  letters=re.search(r'(?:Best single answer: )?([A-F])(?: and ([A-F]))?\s*[-–]',reviewtext)
  if letters: keys=[x for x in letters.groups() if x]
 body=t.split('ANSWER -')[0]
 if q['images']: body=ocr[q['images'][0].split('/')[-1]]
 body=re.sub(r'^.*?Topic #?:?\s*1\s*','',body,flags=re.S)
 body=re.sub(r'^\[.*?\]\s*','',body)
 body=body.split('Show Suggested Answer')[0].strip()
 body=body.replace('Al ','AI ').replace('Al-103','AI-103')
 opts=[]
 if not q['images']:
  parts=re.split(r'\n([A-F])\.\s+',body)
  body=parts[0].strip()
  opts=[dict(id=parts[i],text=re.sub(r'\s*\[Suggested\]|\s*\(\d+ votes\)','',parts[i+1]).strip()) for i in range(1,len(parts),2)]
 elif q['id'] in choices:
  opts=[dict(id=chr(65+i),text=s) for i,s in enumerate(choices[q['id']])]
  body=re.split(r'\nA\. ',body)[0]
 else:
  body=re.split(r'\n(?:NOTE:|Answer Area|Values\b|Statements\b)',body)[0]
  # OCR code remains available only in the original exhibit, not as mangled text.
  body=re.split(r'\n(?:from azure|for brand|def |openai\.|sample_text|az cognitiveservices|docker run|resource existing|You have the following code|You create the following Python|You use the following code)',body)[0]
 body=re.sub(r'^(HOTSPOT|DRAG DROP)\s*-?\s*','',body).strip()
 case=''
 if 'Case Study' in body or 'Case study' in body:
  marker=re.search(r'\nYou need to|\nYou plan to|\nYou are evaluating',body)
  if marker: case=body[:marker.start()];body=body[marker.start():].strip()
 item=dict(id=q['id'],page=q['page'],prompt=body,caseStudy=case,images=q['images'],options=opts,type='multiple' if origkeys and len(origkeys)>1 else 'single',original=origkeys,reviewed=keys,reviewAnswer=reviewtext,explanation=rationale,sourceAnswer=original_section,confidence=review[1] if review else ('High' if ' High' in original_section.split('\n')[0] else 'Review'),fields=[])
 if q['id'] in D:item.update(D[q['id']])
 if q['id'] in [66,68]:
  item['prompt']='The PDF capture ends before the question and answer controls. Read the available case study and review the study answer after finishing.'
  item['note']='Incomplete source capture. This item is available for study but excluded from scoring.'
 if q['id'] in [101,124]:item['note']='The PDF answer keys cover only the first two statements. The third statement is retained for practice and excluded from scoring.'
 if item['reviewed']!=item['original']:item['keyDifference']=True
 if q['id']==8:item['note']='The PDF keys disagree about Storage Blob Data Reader versus Contributor. Scoring follows your selected key; both source explanations are preserved.'
 if q['id']==4:item['note']='The original commentary concerns a different question. Only the reviewed key is usable for this item.'
 result.append(item)
assert len(result)==135
assert [q['id'] for q in result]==list(range(1,136))
for q in result:
 assert q['fields'] or q['options'] or q['type']=='unavailable',q['id']
 for key in ['original','reviewed']:
  if q[key] is not None:
   if q['fields']:assert len(q[key])==len(q['fields']),q['id']
   else:assert all(a in [o['id'] for o in q['options']] for a in q[key]),q['id']
Path('src/data').mkdir(exist_ok=True)
Path('src/data/questions.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print('Created',len(result),'questions. Types:',{k:sum(q['type']==k for q in result) for k in set(q['type'] for q in result)})
# Fix recurring OCR artifacts while preserving all original exhibits.
for q in result:
 q['prompt']=re.sub(r'^\[.*?\n','',q['prompt'])
 q['prompt']=re.sub(r'^(HOTSPOT|DRAG DROP)\s*-?\s*','',q['prompt'])
 q['prompt']=re.split(r'\nActions\s*\n',q['prompt'])[0]
 for field in ['prompt','caseStudy']:
  q[field]=q[field].replace('\ufffd','•')
  for a,b in [('Agentl','Agent1'),('Projectl','Project1'),('Appl','App1'),('Runl','Run1'),('DBI','DB1'),('KVI','KV1'),('i0S','iOS'),('proiect','project'),('AzureA10penTelemetryTracer','AzureAIOpenTelemetryTracer')]:q[field]=q[field].replace(a,b)
result[0]['caseStudy']=result[1]['caseStudy']
for n in [14,119]:
 q=result[n-1]
 q['prompt']=q['prompt'].split('You are provided')[0]+'You are provided with the following code snippet that runs the agent.\nYou need to deterministically force the agent to invoke '+('kbsearch' if n==119 else 'the MCP tool')+' on each run.\nWhat should you '+('do?' if n==119 else 'add?')
 q['code']='run = project_client.agents.runs.create_and_process(\n    thread_id=thread.id,\n    agent_id=agent.id\n)'
result[119]['prompt']='You are developing a text processing solution.\nYou have the following function. You call it with the string "Our tour of London included a visit to Buckingham Palace" as the second argument.\nWhat will be the output of the function?'
result[119]['code']='def get_key_words(textAnalyticsClient, text):\n    response = textAnalyticsClient.recognize_entities(documents=[text])[0]\n    print("Key Words:")\n    for entity in response.entities:\n        print("\\t", entity.text)'
result[100]['code']='for brand in image_analysis.brands:\n    if brand.confidence >= 0.75:\n        print(f"Logo of {brand.name} between "\n              f"{brand.rectangle.x}, {brand.rectangle.y} and "\n              f"{brand.rectangle.w}, {brand.rectangle.h}")'
result[106]['prompt']='You have a Python application that redacts sensitive information before sending prompt text to a language model. The application has the code shown in the original exhibit.\nFor each statement, select Yes if the statement is true. Otherwise, select No.'
result[113]['prompt']='You are building a model to detect objects in images.\nThe training performance exhibit shows Precision: 100.0%, Recall: 25.0%, and mAP: 77.2%.\nSelect the answer that completes each statement based on the exhibit.'
result[120]['code']='from azure.core.credentials import AzureKeyCredential\nfrom azure.ai.textanalytics import TextAnalyticsClient\n\nendpoint = os.environ["AZURE_TEXT_ANALYTICS_ENDPOINT"]\nkey = os.environ["AZURE_TEXT_ANALYTICS_KEY"]\ntext_analytics_client = TextAnalyticsClient(endpoint, AzureKeyCredential(key))\ndocuments = ["Our tour guide took us up the Space Needle during our trip to Seattle last week."]\nresult = text_analytics_client.recognize_linked_entities(documents)'
result[123]['code']='openai.api_key = key\nopenai.api_base = endpoint\nresponse = openai.ChatCompletion.create(\n    engine=deployment_name,\n    messages=[\n        {"role": "system", "content": "You are a helpful assistant."},\n        {"role": "user", "content": "What is an LLM?"}\n    ]\n)\nprint(response["choices"][0]["message"]["content"])'
result[129]['code']='docker run --rm -it -p 5000:5000 --memory 10g --cpus 2 \\\n  mcr.microsoft.com/azure-cognitive-services/textanalytics/sentiment \\\n  Eula=accept \\\n  Billing={ENDPOINT_URI} \\\n  ApiKey={API_KEY}'
result[92]['prompt']=result[92]['prompt'].replace('Protected material evaluation of Run1 : 6%\n• Protected material evaluation of Run1 : 6%','Protected material evaluation of Run1: 6%\n• Protected material evaluation of Run2: 6%')
Path('src/data/questions.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
