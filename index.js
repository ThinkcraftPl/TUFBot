const Discord = require('discord.js');
const { or, InvalidConnectionError } = require('sequelize');
const Sequelize = require('sequelize');
const { debuglog } = require('util');
const { QueryTypes } = require('sequelize');
const credentials = require('./credentials.json');
const config = require('./config.json');
const { cpuUsage } = require('process');
const { pathToFileURL } = require('url');

const client = new Discord.Client();

client.once('ready', () => {
	console.log("Started")
	client.user.setActivity("Ping me! I am curently on "+client.guilds.cache.length)
});

var sequelize = new Sequelize(
    credentials.db,  
    credentials.db_user,  
    credentials.db_password,
	{  
		host: credentials.db_ip,
		port: credentials.db_port,
		dialect: 'mysql',
        // logging: console.log,  
        // define: {  
        //     timestamps: false  
        // }
    }
);  
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
const Component = sequelize.define('Component', {
	name: {
		type: Sequelize.STRING,
		allowNull: false,
		unique:true
	},
	iron: Sequelize.FLOAT,
	silicon: Sequelize.FLOAT,
	nickel: Sequelize.FLOAT,
	cobalt: Sequelize.FLOAT,
	silver: Sequelize.FLOAT,
	gold: Sequelize.FLOAT,
	uranium: Sequelize.FLOAT,
	platinum: Sequelize.FLOAT,
	magnesium: Sequelize.FLOAT,
	gravel:	Sequelize.FLOAT,
	tech2x: Sequelize.FLOAT,
	tech4x: Sequelize.FLOAT,
	tech8x: Sequelize.FLOAT,
	assembletime: Sequelize.FLOAT,
});
const Ore = sequelize.define('Ore', {
	name: {
		type: Sequelize.STRING,
		allowNull:false,
		unique:true
	},
	yield_elite_4xyield: Sequelize.FLOAT,
	speed_elite_4xyield: Sequelize.FLOAT,
});
const UserOpt = sequelize.define('UserOpt',{
	userid:{
		type: Sequelize.BIGINT,
		allowNull:false,
		unique:true
	},
	iron_weight:{type: Sequelize.FLOAT,default: 1,allowNull: false},
	silicon_weight:{type: Sequelize.FLOAT,default: 1,allowNull: false},
	nickel_weight:{type: Sequelize.FLOAT,default: 1,allowNull: false},
	cobalt_weight:{type: Sequelize.FLOAT,default: 1,allowNull: false},
	silver_weight:{type: Sequelize.FLOAT,default: 1,allowNull: false},
	gold_weight:{type: Sequelize.FLOAT,default: 1,allowNull: false},
	uranium_weight:{type: Sequelize.FLOAT,default: 1,allowNull: false},
	platinum_weight:{type: Sequelize.FLOAT,default: 1,allowNull: false},
	magnesium_weight:{type: Sequelize.FLOAT,default: 1,allowNull: false},
	gravel_weight:{type: Sequelize.FLOAT,default: 1,allowNull: false},
	outputtype:{type: Sequelize.BOOLEAN,default: 0,allowNull: false}
});
const Compared = sequelize.define('Compared',{
	name1: {
		type: Sequelize.STRING,
		allowNull:false
	},
	name2: {
		type: Sequelize.STRING,
		allowNull:false
	},
	times: {
		type: Sequelize.INTEGER
	}
})
const ServerOpt = sequelize.define('ServerOpt',{
	serverid:{
		type: Sequelize.BIGINT,
		allowNull:false,
		unique:true
	},
	bot_channel:{
		type: Sequelize.BIGINT
	},
	prefix: {
		type: Sequelize.STRING,
		defaultValue: 'tuf!'
	},
})
const ErrorReport = sequelize.define('ErrorReport',{
	userid: Sequelize.BIGINT,
	username: Sequelize.STRING,
	issue: Sequelize.TEXT,
	sentToLog: Sequelize.BOOLEAN,
	date: {
		type: Sequelize.DATE,
		defaultValue: Sequelize.NOW
	}
})
const CommandLog = sequelize.define('CommandLog', {
	userid: Sequelize.BIGINT,
	serverid: Sequelize.BIGINT,
	username: Sequelize.STRING,
	servername: Sequelize.STRING,
	sentToLog: Sequelize.BOOLEAN,
	message: Sequelize.TEXT,
	date: {
		type: Sequelize.DATE,
		defaultValue: Sequelize.NOW
	}
})
async function getInt(str){
	return parseInt(await getFloat(str))
}
async function getFloat(str){
	str=''+str
	str=str.split(',').join('')
	if(str.endsWith('k')){
		str=str.substring(0,str.length-1)
		num = parseFloat(str)
		if(isNaN(num))
		return num;
		else
		return parseFloat(num*1000);
	}else if(str.endsWith('m')){
		str=str.substring(0,str.length-1)
		num = parseFloat(str)
		if(isNaN(num)){
			return num;
		}
		else{
			return parseFloat(num*1000000);
		}
	}else if(str.endsWith('mil')){
		str=str.substring(0,str.length-3)
		num = parseFloat(str)
		if(isNaN(num))
			return num;
		else
			return parseFloat(num*1000000);
	}else{
		num = parseFloat(str)
		return num;
	}
}
function floatOutput(input,type){
	let output=""
	if(type){
		return Math.round(input/0.01)/100
	}
	if (input>=1000000)
		output=Math.round(input/10000)/100+"mil"
	else if(input>=1000)
		output=Math.round(input/10)/100+"k"
	else
		output=Math.round(input/0.01)/100
	return output;
}
function timeOutput(input,type){
	let output=""
	if(type){
		return Math.round(input/0.01)/100+" seconds"
	}
	if(input>=3600)
		output=Math.round(input/36)/100+" hours"
	else if(input>=60)
		output=Math.round(input/0.6)/100+" minutes"
	else
		output=Math.round(input/0.01)/100+" seconds"
	return output;
}
async function refineryTime(comp){
	const ores = await Ore.findAll();
	let refinerytime=0
	let compores = ["Iron","Silicon","Nickel","Cobalt","Silver","Gold","Uranium","Platinum","Magnesium","Gravel"]
	const common = await Component.findOne({where: {name:'common_tech'}});
	const rare = await Component.findOne({where: {name:'rare_tech'}});
	const exotic = await Component.findOne({where: {name:'exotic_tech'}});
	compores.forEach(element => {
		var amount;
		amount=parseFloat(comp.dataValues[element.toLowerCase()]);
		refinerytime+=amount/ores.find(r=>r.name==element).speed_elite_4xyield
	});
	if(comp.dataValues["tech2x"]!=0)
	{
		refinerytime+=comp.tech2x*(await refineryTime(common))
	}
	if(comp.dataValues["tech4x"]!=0)
	{
		refinerytime+=comp.tech4x*(await refineryTime(rare))
	}
	if(comp.dataValues["tech8x"]!=0)
	{
		refinerytime+=comp.tech8x*(await refineryTime(exotic))
	}
	return refinerytime;
}
async function assemblerTime(comp){
	let assemblertime=0
	const common = await Component.findOne({where: {name:'common_tech'}});
	const rare = await Component.findOne({where: {name:'rare_tech'}});
	const exotic = await Component.findOne({where: {name:'exotic_tech'}});
	if(comp.dataValues["tech2x"]!=0)
	{
		assemblertime+=comp.tech2x*common.assembletime
	}
	if(comp.dataValues["tech4x"]!=0)
	{
		assemblertime+=comp.tech4x*(await assemblerTime(rare))
	}
	if(comp.dataValues["tech8x"]!=0)
	{
		assemblertime+=comp.tech8x*(await assemblerTime(exotic))
	}
	assemblertime+=comp.assembletime
	return assemblertime
}
async function resourceWeight(comp, useroptions){
	const ores = await Ore.findAll();
	let resourceweight=0
	let compores = ["Iron","Silicon","Nickel","Cobalt","Silver","Gold","Uranium","Platinum","Magnesium","Gravel"]
	const common = await Component.findOne({where: {name:'common_tech'}});
	const rare = await Component.findOne({where: {name:'rare_tech'}});
	const exotic = await Component.findOne({where: {name:'exotic_tech'}});
	compores.forEach(element => {
		var amount;
		amount=parseFloat(comp.dataValues[element.toLowerCase()]);
		resourceweight+=amount*useroptions.dataValues[element.toLowerCase()+"_weight"]
		
	});
	if(comp.dataValues["tech2x"]!=0)
	{
		resourceweight+=comp.tech2x*(await resourceWeight(common, useroptions))
	}
	if(comp.dataValues["tech4x"]!=0)
	{
		resourceweight+=comp.tech4x*(await resourceWeight(rare, useroptions))
	}
	if(comp.dataValues["tech8x"]!=0)
	{
		resourceweight+=comp.tech8x*(await resourceWeight(exotic, useroptions))
	}
	return resourceweight;
}
async function addToCompared(name1,name2){
	const compa = await Compared.findOne({where:{name1:name1,name2:name2}})
	if(compa!=null){
		await Compared.update({name1:name1, name2:name2, times: compa.times+1},{where:{name1:name1,name2:name2}})
	}else{
		await Compared.create({
			name1:name1,
			name2:name2,
			times:1
		});
	}
}
async function updateReportChannel(){
	const rep = await ErrorReport.findAll({where:{sentToLog:false}})
	try{
		const errch = client.guilds.cache.find(r=>r.id==config.main_server).channels.cache.find(r=>r.id==config.error_report)
		if(errch!=null){
			rep.forEach(element => {
				let embed = new Discord.MessageEmbed()
					.setTitle("Error report")
					.setDescription(element.issue)
					.setAuthor('TUF','https://i.imgur.com/aJfvqAB.png','https://discord.gg/56tChXdzzP')
					.setFooter(element.username+' ('+element.userid+') at '+element.date);
				errch.send(embed)
			});
			ErrorReport.update({sentToLog:true},{where:{sentToLog:false}})
		}
	}catch(e){
		console.log(e)
	}
}
async function updateCommandLog(){
	const logs= await CommandLog.findAll({where:{sentToLog:false}})
	try{
		const logch = client.guilds.cache.find(r=>r.id==config.main_server).channels.cache.find(r=>r.id==config.command_logs)
		if(logch!=null){
			logs.forEach(element => {
				let embed = new Discord.MessageEmbed()
					.setTitle("Log")
					.setDescription(element.message)
					.setAuthor('TUF','https://i.imgur.com/aJfvqAB.png','https://discord.gg/56tChXdzzP')
					.setFooter(element.username+' ('+element.userid+') at '+element.date+'\n'+element.servername+' ('+element.serverid+')');
				logch.send(embed)
			});
			CommandLog.update({sentToLog:true},{where:{sentToLog:false}})
		}else{
			console.log(logch)
		}
	}catch(e){
		console.log(e)
	}
}
//1=1
sequelize.sync({alter: false, force: false});
client.on('guildCreate', async guild =>{
	console.log("new server")
	client.user.setActivity("Ping me! I am curently on "+client.guilds.cache.length)
});
client.on('message', async message => {
	let serveroptions = await ServerOpt.findOne({where: {serverid: message.guild.id}})
	if(serveroptions===null)
		{
			try{
				const serveropt = await ServerOpt.create({
					serverid: message.guild.id,
					prefix: "tuf!",
					bot_channel: null
				});
			}catch(e){
				console.log(e)
			}
			serveroptions = await ServerOpt.findOne({where: {serverid: message.guild.id}})
		}
	//const PREFIX = 't!'
	const PREFIX = serveroptions.prefix;
	if (message.content.startsWith(PREFIX)) {
		{
			if(message.channel.id==845911309614186496){
				const input = message.content.slice(PREFIX.length).trim().split(' ');
				const command = input.shift();
				const commandArgs = input.join(' ').split(' ');
				if (command === 'addcomp'){
					{
					try {
						const comp = await Component.create({
							name: commandArgs[0],
							iron: parseFloat(commandArgs[1]),
							silicon: parseFloat(commandArgs[2]),
							nickel: parseFloat(commandArgs[3]),
							cobalt: parseFloat(commandArgs[4]),
							silver: parseFloat(commandArgs[5]),
							gold: parseFloat(commandArgs[6]),
							uranium: parseFloat(commandArgs[7]),
							platinum: parseFloat(commandArgs[8]),
							magnesium: parseFloat(commandArgs[9]),
							gravel: parseFloat(commandArgs[10]),
							tech2x: parseFloat(commandArgs[11]),
							tech4x: parseFloat(commandArgs[12]),
							tech8x: parseFloat(commandArgs[13]),
							assembletime: parseFloat(commandArgs[14]),
						});
					}
					catch (e) {
						console.log(e)
						message.reply("there was an error");
					}
					}
				}else if(command === 'addore'){
					{
					try {
						const ore = await Ore.create({
							name: commandArgs[0],
							yield_elite_4xyield: parseFloat(commandArgs[1]),
							speed_elite_4xyield: parseFloat(commandArgs[2])
						});
					}
					catch (e) {
						console.log(e)
						message.reply("there was an error");
					}
					}
				}else if(command === 'comparelist'){
					let compa = await Compared.findAll();
					let embed = new Discord.MessageEmbed()
						.setTitle("I know of this component comparasons:")
						.setDescription(compa.map(t => t.name1+' '+t.name2+' '+t.times).join('\n') || 'No components compared yet.')
						.setAuthor('TUF','https://i.imgur.com/aJfvqAB.png','https://discord.gg/56tChXdzzP')
						.setFooter("If you see this and you don't know why, report an error");
					message.channel.send(embed)
				}
			}
		}
		
		if(serveroptions.bot_channel===null || message.channel.id==serveroptions.bot_channel){
			
			const input = message.content.slice(PREFIX.length).trim().split(' ');
			const command = input.shift();
			const commandArgs = input.join(' ').split(' ');
			{
				await CommandLog.create({
					userid:message.author.id,
					username:message.author.username,
					message: message.content,
					serverid:message.guild.id,
					servername:message.guild.name,
					sentToLog: false,
				});
				await updateCommandLog()
			}
			
			let useroptions = await UserOpt.findOne({where: {userid: message.author.id}})
			if(useroptions===null)
			{
				try{
					const useropt = await UserOpt.create({
						userid: message.author.id,
						iron_weight: 1,
						silicon_weight: 1,
						nickel_weight: 1,
						cobalt_weight: 1,
						silver_weight: 1,
						gold_weight: 1,
						uranium_weight: 1,
						platinum_weight: 1,
						magnesium_weight: 1,
						gravel_weight: 1,
						outputtype: 0,
					});
				}catch(e){
					console.log(e)
				}
				useroptions = await UserOpt.findOne({where: {userid: message.author.id}})
			}
			if(command === 'complist')
			{
				const comps = await Component.findAll();
				var desc="Name | Fe | Si | Ni | Co | Ag | Au | Ur | Pl | Mg | Gravel | 2x | 4x | 8x | assembletime\n";
				(comps).forEach(element => {
					desc+=element.name+" | "+element.iron+" | "+element.silicon+" | "+element.nickel+" | "+element.cobalt+" | "+element.silver+" | "+element.gold+" | "+element.uranium+" | "+element.platinum+" | "+element.magnesium+" |" + element.gravel +" | "+element.tech2x+" | "+element.tech4x+" | "+element.tech8x+" | "+element.assembletime+"\n";
				});
				let embed = new Discord.MessageEmbed()
					.setTitle("I know of this components:")
					.setDescription(desc)
					.setAuthor('TUF','https://i.imgur.com/aJfvqAB.png','https://discord.gg/56tChXdzzP')
					.setFooter('Assemble time using elite assembler with 4 speed modules and time measured by timer on phone');
				message.channel.send(embed);
			}else if(command === 'orelist'){
				const ores = await Ore.findAll();
				var desc="Name | Yield Elite 4xYield | Speed Elite 4xYield\n";
				(ores).forEach(element => {
					desc+=element.name+" | "+element.yield_elite_4xyield+" | "+element.speed_elite_4xyield+"\n";
				});
				let embed = new Discord.MessageEmbed()
					.setTitle("I know of this ores:")
					.setDescription(desc)
					.setAuthor('TUF','https://i.imgur.com/aJfvqAB.png','https://discord.gg/56tChXdzzP')
					.setFooter('All data is from tests on the nexus PvE SPACE');
				message.channel.send(embed);
			}else if(command === 'compinfo'){
				const comp = await Component.findOne({where: {name:commandArgs[0]}});
				if(comp==null)
				{
					message.reply("There is no such component! To see list of components run `"+PREFIX+"complist`!")
				}else
				{
					let compamount=await getInt(commandArgs[1])
					if(isNaN(compamount))
						compamount=1
					const ores = await Ore.findAll();
					let compores = ["Iron","Silicon","Nickel","Cobalt","Silver","Gold","Uranium","Platinum","Magnesium","Gravel"]
					var refinerytime=0, assemblertime=0;
					let embed = new Discord.MessageEmbed()
						.setTitle(comp.name+" info ("+floatOutput(compamount,useroptions.outputtype)+")")
						.setAuthor('TUF','https://i.imgur.com/aJfvqAB.png','https://discord.gg/56tChXdzzP')
						.setFooter('Default time is measured using elite 4x yield refineries and elite 4x speed assemblers');
					compores.forEach(element => {
						var amount;
						amount=parseFloat(comp.dataValues[element.toLowerCase()]);
						amount=amount*compamount
						if(amount!=0)
							embed.addField(element, floatOutput(amount,useroptions.outputtype), true);
					});
					refinerytime=await refineryTime(comp)
					assemblertime=await assemblerTime(comp)
					refinerytime*=compamount
					assemblertime*=compamount
					assemblertime=Math.round(assemblertime*100)/100
					refinerytime=Math.round(refinerytime*100)/100
					
					embed.setDescription("Refinery time: "+timeOutput(refinerytime,useroptions.outputtype)+"\nAssembler time: "+timeOutput(assemblertime,useroptions.outputtype));
					if(comp.dataValues["tech2x"]!=0)
						embed.addField("Common Tech",floatOutput(comp.tech2x*compamount,useroptions.outputtype),true);
					if(comp.dataValues["tech4x"]!=0)
						embed.addField("Rare Tech",floatOutput(comp.tech4x*compamount,useroptions.outputtype),true);
					if(comp.dataValues["tech8x"]!=0)
						embed.addField("Exotic Tech",floatOutput(comp.tech8x*compamount,useroptions.outputtype),true);
					message.channel.send(embed);
				}
			}else if(command === 'compare'){
				const comp1 = await Component.findOne({where: {name:commandArgs[0]}});
				const common = await Component.findOne({where: {name:'common_tech'}});
				const rare = await Component.findOne({where: {name:'rare_tech'}});
				const exotic = await Component.findOne({where: {name:'exotic_tech'}});
				let astime1=0,retime1=0,name1=0,weight1=0,error=false;
				if(comp1==null){
					const ore1 = await Ore.findOne({where: {name:commandArgs[0]}});
					if(ore1!=null){
						name1=ore1.name
						retime1=1/ore1.speed_elite_4xyield
						astime1=0
						weight1=useroptions.dataValues[name1.toLowerCase()+"_weight"]
					}else{
						error=true
					}
				}else{
					name1=comp1.name
					let refinerytime=await refineryTime(comp1)
					let assemblertime=await assemblerTime(comp1)
					astime1=assemblertime
					retime1=refinerytime
					weight1=await resourceWeight(comp1,useroptions)
				}
				let astime2=0,retime2=0,weight2=0,name2=0;
				const comp2 = await Component.findOne({where: {name:commandArgs[2]}});
				if(comp2==null){
					const ore2 = await Ore.findOne({where: {name:commandArgs[2]}});
					if(ore2!=null){
						name2=ore2.name
						retime2=1/ore2.speed_elite_4xyield
						astime2=0
						weight2=useroptions.dataValues[name2.toLowerCase()+"_weight"]
					}else{
						error=true
					}
				}else{
					name2=comp2.name
					let assemblertime=await assemblerTime(comp2);
					let refinerytime=await refineryTime(comp2)
					astime2=assemblertime
					retime2=refinerytime
					weight2=await resourceWeight(comp2,useroptions)
				}
				comparednumber=await getInt(commandArgs[1])
				if(isNaN(comparednumber))
					error=true;
				if(error)
				{
					message.reply("At least one of compared items does not exist in the database, or number specified is not a number")
				}else{
					addToCompared(name1,name2)
					let embed = new Discord.MessageEmbed()
							.setTitle("Comparison between "+name1+" and "+name2)
							.setAuthor('TUF','https://i.imgur.com/aJfvqAB.png','https://discord.gg/56tChXdzzP')
							.setFooter('Default time is measured using elite 4x yield refineries and elite 4x speed assemblers.');
					if(astime1==0 || astime2==0){
						message.reply("At least one of compared items is an ingot, so assembler time is not compared")
						embed.addField("Refining time comparison:",""+floatOutput(comparednumber,useroptions.outputtype)+" of "+name1+" is worth the same as "+floatOutput(comparednumber*retime1/retime2,useroptions.outputtype)+" of "+name2)
						embed.addField("Resource weight comparison (user preferences can be changed using tuf!useropt)",""+floatOutput(comparednumber,useroptions.outputtype)+" of "+name1+" is worth the same as "+floatOutput(comparednumber*weight1/weight2,useroptions.outputtype)+" of "+name2)
					}else{
						
						embed.addField("Assembling time comparison:",""+floatOutput(comparednumber,useroptions.outputtype)+" of "+name1+" is worth the same as "+floatOutput(comparednumber*astime1/astime2,useroptions.outputtype)+" of "+name2)
						embed.addField("Refining time comparison:",""+floatOutput(comparednumber,useroptions.outputtype)+" of "+name1+" is worth the same as "+floatOutput(comparednumber*retime1/retime2,useroptions.outputtype)+" of "+name2)
						embed.addField("Max of both times time comparison:",""+floatOutput(comparednumber,useroptions.outputtype)+" of "+name1+" is worth the same as "+floatOutput(comparednumber*Math.max(retime1,astime1)/Math.max(retime2,astime2),useroptions.outputtype)+" of "+name2)
						embed.addField("Resource weight comparison (user preferences can be changed using tuf!useropt)",""+floatOutput(comparednumber,useroptions.outputtype)+" of "+name1+" is worth the same as "+floatOutput(comparednumber*weight1/weight2,useroptions.outputtype)+" of "+name2)
					}
					message.channel.send(embed)
				}
			}else if(command === 'useropt'){
				const avoptions = ["iron_weight","silicon_weight","nickel_weight","cobalt_weight","silver_weight","gold_weight","uranium_weight","platinum_weight","magnesium_weight","gravel_weight","outputtype"]
				let x;
				if(avoptions.find(r=>r==commandArgs[0])==x)
				{	
					let embed = new Discord.MessageEmbed()
						.setTitle(message.author.username+" options")
						.setAuthor('TUF','https://i.imgur.com/aJfvqAB.png','https://discord.gg/56tChXdzzP')
						.setFooter('To change option type '+PREFIX+'useropt `option_code` `new value`');
					avoptions.forEach(element=>{
						if(element=='outputtype')
							embed.addField('outputtype: '+useroptions.dataValues[element],'false means data outputs get shortened (to k and mil), true means data stays raw.')
						else if(element.endsWith('_weight')){
							let ingotname=element.substring(0, element.length - 7);
							ingotname=ingotname.substring(0,1).toUpperCase()+ingotname.substring(1, ingotname.length)
							embed.addField(element+': '+useroptions.dataValues[element],'Weight of '+ingotname+' when used in comparison of two components.')
						}
					})
					message.channel.send(embed)	
				}else{
					let newvalue;
					if(commandArgs[0]=="outputtype")
					{
						if(commandArgs[1]=="true")
							newvalue=true;
						else
							newvalue=false;
					}else{
						if(isNaN(await getFloat(commandArgs[1]))){
							newvalue=1;
						}else{
							newvalue=await getFloat(commandArgs[1])
						}
					}
					let column=commandArgs[0]
						if(column=="iron_weight") 		await UserOpt.update({ iron_weight: newvalue }, 		{where: {userid: message.author.id}});
					else if(column=="silicon_weight") 	await UserOpt.update({ silicon_weight: newvalue }, 	{where: {userid: message.author.id}});
					else if(column=="nickel_weight") 	await UserOpt.update({ nickel_weight: newvalue }, 		{where: {userid: message.author.id}});
					else if(column=="cobalt_weight") 	await UserOpt.update({ cobalt_weight: newvalue }, 		{where: {userid: message.author.id}});
					else if(column=="silver_weight") 	await UserOpt.update({ silver_weight: newvalue }, 		{where: {userid: message.author.id}});
					else if(column=="gold_weight") 		await UserOpt.update({ gold_weight: newvalue }, 		{where: {userid: message.author.id}});
					else if(column=="uranium_weight") 	await UserOpt.update({ uranium_weight: newvalue }, 	{where: {userid: message.author.id}});
					else if(column=="platinum_weight") 	await UserOpt.update({ platinum_weight: newvalue }, 	{where: {userid: message.author.id}});
					else if(column=="magnesium_weight") await UserOpt.update({ magnesium_weight: newvalue }, 	{where: {userid: message.author.id}});
					else if(column=="gravel_weight") 	await UserOpt.update({ gravel_weight: newvalue }, 		{where: {userid: message.author.id}});
					else if(column=="outputtype") 		await UserOpt.update({ outputtype: newvalue }, 		{where: {userid: message.author.id}});
					message.reply("Option "+column+" changed to "+newvalue+".")
				}
			}else if(command === 'report'){
				const report = await ErrorReport.create({
					userid:message.author.id,
					username:message.author.username,
					issue: commandArgs.join(' '),
					sentToLog: false,
				})
				await updateReportChannel()
				message.reply("Report sent")
			}else if(command === 'help'){
				let embed = new Discord.MessageEmbed()
					.setTitle("Ambulance is on the way, but i got here first!")
					.setDescription("<argument> (optional_argument)")
					.addField('`'+PREFIX+'complist`','Shows a available component list')
					.addField('`'+PREFIX+'orelist`','Shows a available ore list')
					.addField('`'+PREFIX+'compinfo <comp_name> (amount)`','Shows info about specified component')
					.addField('`'+PREFIX+'oreinfo <ore_name> (amount)`','Shows info about specified ore')
					.addField('`'+PREFIX+'compare <comp1_name> <amount> <comp2_name>`','Compares 2 components')
					.addField('`'+PREFIX+'useropt (opt_name) (opt_value)`','Shows available personal options')
					.addField('`'+PREFIX+'serveropt (opt_name) (opt_value)`','Shows available server options. You need to have admin permissions')
					.addField('`'+PREFIX+'report <issue>`','Reports an issue')
					.setAuthor('TUF','https://i.imgur.com/aJfvqAB.png','https://discord.gg/56tChXdzzP')
					.setFooter('Get available commands with `'+PREFIX+'help`');
				message.channel.send(embed)
			}else if(command === 'serveropt'){
				const avoptions = ["bot_channel","prefix"]
				let x;
				if(avoptions.find(r=>r==commandArgs[0])==x)
				{	
					let embed = new Discord.MessageEmbed()
						.setTitle(message.guild.name+" options")
						.setAuthor('TUF','https://i.imgur.com/aJfvqAB.png','https://discord.gg/56tChXdzzP')
						.setFooter('To change option type '+PREFIX+'serveropt `option_code` `new value`');
					avoptions.forEach(element=>{
						if(element=='bot_channel')
							embed.addField('bot_channel: '+serveroptions.bot_channel,'Bot channel, bot will only respond there')
						else if(element=='prefix'){
							embed.addField('prefix: '+serveroptions.prefix,'Prefix bot will respond to')
						}
					})
					message.channel.send(embed)
					message.channel.send("Disclaimer:`Every message starting with server prefix, or any message that pings this bot is recorded and saved in the database for debugging purposes. If you do not agree, do not use the bot. If you have any questions join WWI discord and ask any questions.`")
				}else if(message.member.hasPermission("ADMINISTRATOR")){
					let newvalue;
					if(commandArgs[0]=="bot_channel")
					{
						if(message.mentions.channels.first()!=null)
							newvalue=message.mentions.channels.first().id;
						else
						{
							newvalue=null;
							message.reply("please ping a channel")
						}
					}else if(commandArgs[0]=="prefix"){
						if(commandArgs[1].length>0)
							newvalue=commandArgs[1];
						else
							newvalue="tuf!"
					}
					let column=commandArgs[0]
						if(column=="bot_channel") 		await ServerOpt.update({ bot_channel: newvalue}, 		{where: {serverid: message.guild.id}});
					else if(column=="prefix") 			await ServerOpt.update({ prefix: newvalue }, 		{where: {serverid: message.guild.id}});
					message.reply("Option "+column+" changed to "+newvalue+".")
				}
				
			}else if(command === 'oreinfo'){
				const ore = await Ore.findOne({where: {name:commandArgs[0]}});
				if(ore==null)
				{
					message.reply("There is no such ore! To see list of ores run `"+PREFIX+"orelist`!")
				}else
				{
					let oreamount=await getInt(commandArgs[1])
					if(isNaN(oreamount))
						oreamount=1
					let embed = new Discord.MessageEmbed()
						.setTitle(floatOutput(oreamount)+' of '+ore.name+' ore')
						.setAuthor('TUF','https://i.imgur.com/aJfvqAB.png','https://discord.gg/56tChXdzzP')
						.setFooter('To change option type '+PREFIX+'useropt `option_code` `new value`');
					embed.addField('Time to refine '+' with 1 elite refinery with 4 yield modules',timeOutput(oreamount*ore.yield_elite_4xyield/ore.speed_elite_4xyield))
					embed.addField('Ingots from refining '+' with 1 elite refinery with 4 yield modules',floatOutput(oreamount*ore.yield_elite_4xyield))
					message.channel.send(embed)
				}
			}
		}
	}else{
		if(message.mentions.users.first()!=null){
			if(message.mentions.users.first().id==843917476014063658){
				{
					await CommandLog.create({
						userid:message.author.id,
						username:message.author.username,
						message: message.content,
						serverid:message.guild.id,
						servername:message.guild.name,
						sentToLog: false,
					});
					await updateCommandLog()
				}
				let embed = new Discord.MessageEmbed()
					.setTitle("I see you")
					.setDescription("Prefix for this server is `"+PREFIX+'`')
					.setAuthor('TUF','https://i.imgur.com/aJfvqAB.png','https://discord.gg/56tChXdzzP')
					.setFooter('Get available commands with `'+PREFIX+'help`');
				message.channel.send(embed);

			}
		}
	}
	
});

client.login(credentials.bot_token);