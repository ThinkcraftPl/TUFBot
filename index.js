const Discord = require('discord.js');
const { or } = require('sequelize');
const Sequelize = require('sequelize');
const { debuglog } = require('util');
const credentials = require('./credentials.json');

const client = new Discord.Client();
const PREFIX = 'tuf!';

client.once('ready', () => {
	console.log("Started")
});

var sequelize = new Sequelize(
    credentials.db,  
    credentials.db_user,  
    credentials.db_password,
	{  
		host: credentials.db_ip,
		port: credentials.db_port,
		dialect: 'mysql',
        logging: console.log,  
        define: {  
            timestamps: false  
        }  
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
	gravel:{
		type: Sequelize.FLOAT,
		default: 0
	},
	tech2x: Sequelize.FLOAT,
	tech4x: Sequelize.FLOAT,
	tech8x: Sequelize.FLOAT,
	assembletime: Sequelize.FLOAT,
});
Component.sync({ alter: true });
const Ore = sequelize.define('Ore', {
	name: {
		type: Sequelize.STRING,
		allowNull:false,
		unique:true
	},
	yield_elite_4xyield: Sequelize.FLOAT,
	speed_elite_4xyield: Sequelize.FLOAT,
});
Ore.sync({ alter: true });
const UserOpt = sequelize.define('UserOpt',{
	userid:{
		type: Sequelize.BIGINT,
		allowNull:false,
		unique:true
	},
	iron_weight:{type: Sequelize.FLOAT,default: 1},
	silicon_weight:{type: Sequelize.FLOAT,default: 1},
	nickel_weight:{type: Sequelize.FLOAT,default: 1},
	cobalt_weight:{type: Sequelize.FLOAT,default: 1},
	silver_weight:{type: Sequelize.FLOAT,default: 1},
	gold_weight:{type: Sequelize.FLOAT,default: 1},
	uranium_weight:{type: Sequelize.FLOAT,default: 1},
	platinum_weight:{type: Sequelize.FLOAT,default: 1},
	magnesium_weight:{type: Sequelize.FLOAT,default: 1},
	gravel_weight:{type: Sequelize.FLOAT,default: 1},
	outputtype:{type: Sequelize.BOOLEAN,default: 0}
});
UserOpt.sync({alter: true});
function floatOutput(input){
	let output=""
	if (input>=1000000)
		output=Math.round(input/10000)/100+"mil"
	else if(input>=1000)
		output=Math.round(input/10)/100+"k"
	else
		output=Math.round(input/0.01)/100
	return output;
}
function timeOutput(input){
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
	let compores = ["Iron","Silicon","Nickel","Cobalt","Silver","Gold","Uranium","Platinum","Magnesium"]
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

client.on('message', async message => {
	if (message.content.startsWith(PREFIX)) {
		const input = message.content.slice(PREFIX.length).trim().split(' ');
		const command = input.shift();
		const commandArgs = input.join(' ').split(' ');
		if (command === 'addcomp'){
			if(message.author.id==404361385863282688){
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
						tech2x: parseFloat(commandArgs[10]),
						tech4x: parseFloat(commandArgs[11]),
						tech8x: parseFloat(commandArgs[12]),
						assembletime: parseFloat(commandArgs[13]),
					});
				}
				catch (e) {
					console.log(e)
					message.reply("there was an error");
				}
			}else{
				message.reply("You have not enough permissions to perform this command");
			}
		}else if(command === 'complist')
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
		}else if(command === 'addore'){
			if(message.author.id==404361385863282688){
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
			}else{
				message.reply("You have not enough permissions to perform this command");
			}
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
				let compamount=parseInt(commandArgs[1])
				if(isNaN(compamount))
					compamount=1
				const ores = await Ore.findAll();
				let compores = ["Iron","Silicon","Nickel","Cobalt","Silver","Gold","Uranium","Platinum","Magnesium","Gravel"]
				var refinerytime=0, assemblertime=0;
				let embed = new Discord.MessageEmbed()
					.setTitle(comp.name+" info ("+floatOutput(compamount)+")")
					.setAuthor('TUF','https://i.imgur.com/aJfvqAB.png','https://discord.gg/56tChXdzzP')
					.setFooter('Default time is measured using elite 4x yield refineries and elite 4x speed assemblers');
				compores.forEach(element => {
					var amount;
					amount=parseFloat(comp.dataValues[element.toLowerCase()]);
					amount=amount*compamount
					if(amount!=0)
						embed.addField(element, floatOutput(amount), true);
				});
				refinerytime=await refineryTime(comp)
				assemblertime=await assemblerTime(comp)
				refinerytime*=compamount
				assemblertime*=compamount
				assemblertime=Math.round(assemblertime*100)/100
				refinerytime=Math.round(refinerytime*100)/100
				
				embed.setDescription("Refinery time: "+timeOutput(refinerytime)+"\nAssembler time: "+timeOutput(assemblertime));
				if(comp.dataValues["tech2x"]!=0)
					embed.addField("Common Tech",floatOutput(comp.tech2x*compamount),true);
				if(comp.dataValues["tech4x"]!=0)
					embed.addField("Rare Tech",floatOutput(comp.tech4x*compamount),true);
				if(comp.dataValues["tech8x"]!=0)
					embed.addField("Exotic Tech",floatOutput(comp.tech8x*compamount),true);
				message.channel.send(embed);
			}
		}else if(command === 'compare'){
			const comp1 = await Component.findOne({where: {name:commandArgs[0]}});
			const common = await Component.findOne({where: {name:'common_tech'}});
			const rare = await Component.findOne({where: {name:'rare_tech'}});
			const exotic = await Component.findOne({where: {name:'exotic_tech'}});
			let astime1=0,retime1=0,name1=0,error=false;
			if(comp1==null){
				const ore1 = await Ore.findOne({where: {name:commandArgs[0]}});
				if(ore1!=null){
					name1=ore1.name
					retime1=1/ore1.speed_elite_4xyield
					astime1=0
				}else{
					error=true
				}
			}else{
				name1=comp1.name
				let refinerytime=await refineryTime(comp1)
				let assemblertime=await assemblerTime(comp1)
				console.log(assemblertime)
				astime1=assemblertime
				retime1=refinerytime
			}
			let astime2=0,retime2=0,name2=0;
			const comp2 = await Component.findOne({where: {name:commandArgs[2]}});
			if(comp2==null){
				const ore2 = await Ore.findOne({where: {name:commandArgs[2]}});
				if(ore2!=null){
					name2=ore2.name
					retime2=1/ore2.speed_elite_4xyield
					astime2=0
				}else{
					error=true
				}
			}else{
				name2=comp2.name
				let assemblertime=await assemblerTime(comp2);
				let refinerytime=await refineryTime(comp2)
				console.log(assemblertime)
				astime2=assemblertime
				retime2=refinerytime
			}
			comparednumber=parseInt(commandArgs[1])
			if(isNaN(comparednumber))
				error=true;
			if(error)
			{
				message.reply("At least one of compared items does not exist in the database, or number specified is not a number")
			}else{
				let embed = new Discord.MessageEmbed()
						.setTitle("Comparison between "+name1+" and "+name2)
						.setAuthor('TUF','https://i.imgur.com/aJfvqAB.png','https://discord.gg/56tChXdzzP')
						.setFooter('Default time is measured using elite 4x yield refineries and elite 4x speed assemblers.');
				if(astime1==0 || astime2==0){
					message.reply("At least one of compared items is an ingot, so only refining time is compared")
					embed.addField("Refining time comparison:",""+floatOutput(comparednumber)+" of "+name1+" is worth the same as "+floatOutput(comparednumber*retime1/retime2)+" of "+name2)
				}else{
					
					embed.addField("Assembling time comparison:",""+floatOutput(comparednumber)+" of "+name1+" is worth the same as "+floatOutput(comparednumber*astime1/astime2)+" of "+name2)
					embed.addField("Refining time comparison:",""+floatOutput(comparednumber)+" of "+name1+" is worth the same as "+floatOutput(comparednumber*retime1/retime2)+" of "+name2)
					embed.addField("Max of both times time comparison:",""+floatOutput(comparednumber)+" of "+name1+" is worth the same as "+floatOutput(comparednumber*Math.max(retime1,astime1)/Math.max(retime2,astime2))+" of "+name2)
				}
				message.channel.send(embed)
			}
		}else if(command === 'useropt'){
			switch(commandArgs[0]){

				default:
					const avoptions = ["iron_weight","silicon_weight","nickel_weight","cobalt_weight","silver_weight","gold_weight","uranium_weight","platinum_weight","magnesium_weight","gravel_weight","outputtype"]
					let useroptions = await UserOpt.findOne({where: {userid: message.author.id}})
					if(useroptions==null)
					{
						try{
							const useropt = await UserOpt.create({
								userid: message.author.id
							});
						}catch(e){
							console.log(e)
						}
						useroptions = await UserOpt.findOne({where: {userid: message.author.id}})
					}
					let embed = new Discord.MessageEmbed()
						.setTitle(message.author.username+" options")
						.setAuthor('TUF','https://i.imgur.com/aJfvqAB.png','https://discord.gg/56tChXdzzP')
						.setFooter('To change option type '+PREFIX+'useropt `option_code` `new value`');
					avoptions.forEach(element=>{
						if(element==outputtype)
							embed.addField('Output type: '+useroptions.dataValues[element],'0 means data outputs get shortened (to k and mil), 1 means data stays raw.')
						else if(element.endsWith('_weight')){
							let ingotname=element.substring(0, element.length - 7);
							ingotname=ingotname.substring(0,1).toUpperCase()+ingotname.substring(1, ingotname.length)
							embed.addField(element+': '+useroptions.dataValues[element],'Weight of '+ingotname+' when used in comparison of two components.')
						}
					})
					message.channel.send(embed)
					break;
			}
		}
		{
		/*if (command === 'common') {
			let number=parseInt(commandArgs[0])
			var desc=""
			desc+="Iron ingots: "+Math.round(90*number)+"\n"
			desc+="Silicon wafers: "+Math.round(80*number)+"\n"
			desc+="Cobalt ingots: "+Math.round(32*number)+"\n"
			desc+="Silver ingots: "+Math.round(24*number)+"\n"
			desc+="Gold ingots: "+Math.round(16*number)+"\n\n"

			desc+="Iron ore: "+Math.round(90*number/1.7)+"\n"
			desc+="Silicon ore: "+Math.round(80*number/1.7)+"\n"
			desc+="Cobalt ore: "+Math.round(32*number/0.72)+"\n"
			desc+="Silver ore: "+Math.round(24*number/0.24)+"\n"
			desc+="Gold ore: "+Math.round(16*number/0.024)+"\n\n"

			desc+="Time to refine with 1 refinery: "+Math.round(26.54*number)+" seconds or "+Math.round(26.54*number/60)+" minutes or "+Math.round(26.54*number/3600)+" hours\n"
			desc+="Time to refine with 10 refineries: "+Math.round(2.654*number)+" seconds or "+Math.round(2.654*number/60)+" minutes or "+Math.round(2.654*number/3600)+" hours"
			if(number!=null){
				let embed = new Discord.MessageEmbed()
					.setTitle("Resources needed to make "+commandArgs[0]+" common tech with full yield elite refineries")
					.setDescription(desc);
				message.channel.send(embed)
			}
		}else if (command === 'rare') {
			let number=parseInt(commandArgs[0])
			var desc=""
			desc+="Iron ingots: "+Math.round(5*90*number)+"\n"
			desc+="Silicon wafers: "+Math.round(5*80*number)+"\n"
			desc+="Cobalt ingots: "+Math.round(5*32*number)+"\n"
			desc+="Silver ingots: "+Math.round(5*24*number)+"\n"
			desc+="Gold ingots: "+Math.round(5*16*number)+"\n"
			desc+="Uranium ingots: "+Math.round(10*number)+"\n\n"

			desc+="Iron ore: "+Math.round(5*90*number/1.7)+"\n"
			desc+="Silicon ore: "+Math.round(5*80*number/1.7)+"\n"
			desc+="Cobalt ore: "+Math.round(5*32*number/0.72)+"\n"
			desc+="Silver ore: "+Math.round(5*24*number/0.24)+"\n"
			desc+="Gold ore: "+Math.round(5*16*number/0.024)+"\n"
			desc+="Uranium ore:  "+Math.round(10*number/0.024)+"\n\n"

			desc+="Time to refine with 1 refinery: "+Math.round(216*number)+" seconds or "+Math.round(216*number/60)+" minutes or "+Math.round(216*number/3600)+" hours\n"
			desc+="Time to refine with 10 refineries: "+Math.round(21.6*number)+" seconds or "+Math.round(21.6*number/60)+" minutes or "+Math.round(21.6*number/3600)+" hours"
			if(number!=null){
				let embed = new Discord.MessageEmbed()
					.setTitle("Resources needed to make "+commandArgs[0]+" rare tech with full yield elite refineries")
					.setDescription(desc);
				message.channel.send(embed)
			}
		}else if (command === 'exotic') {
			let number=parseInt(commandArgs[0])
			var desc=""
			desc+="Iron ingots: "+Math.round(25*90*number)+" ("+Math.round(25*90*number/10000)/100+" mil)"+"\n"
			desc+="Silicon wafers: "+Math.round(25*80*number)+" ("+Math.round(25*80*number/10000)/100+" mil)"+"\n"
			desc+="Cobalt ingots: "+Math.round(25*32*number)+" ("+Math.round(25*32*number/10000)/100+" mil)"+"\n"
			desc+="Silver ingots: "+Math.round(25*24*number)+" ("+Math.round(25*24*number/10000)/100+" mil)"+"\n"
			desc+="Gold ingots: "+Math.round(25*16*number)+" ("+Math.round(25*16*number/10000)/100+" mil)"+"\n"
			desc+="Uranium ingots: "+Math.round(5*10*number)+" ("+Math.round(5*10*number/10000)/100+" mil)"+"\n"
			desc+="Platinum ingots: "+Math.round(10*number)+" ("+Math.round(10*number/10000)/100+" mil)"+"\n\n"

			desc+="Iron ore: "+Math.round(25*90*number/1.7)+" ("+Math.round(25*90*number/1.7/10000)/100+" mil)"+"\n"
			desc+="Silicon ore: "+Math.round(25*80*number/1.7)+" ("+Math.round(25*80*number/1.7/10000)/100+" mil)"+"\n"
			desc+="Cobalt ore: "+Math.round(25*32*number/0.72)+" ("+Math.round(25*32*number/0.72/10000)/100+" mil)"+"\n"
			desc+="Silver ore: "+Math.round(25*24*number/0.24)+" ("+Math.round(25*24*number/0.24/10000)/100+" mil)"+"\n"
			desc+="Gold ore: "+Math.round(25*16*number/0.024)+" ("+Math.round(25*16*number/0.024/10000)/100+" mil)"+"\n"
			desc+="Uranium ore:  "+Math.round(5*10*number/0.024)+" ("+Math.round(5*10*number/0.024/10000)/100+" mil)"+"\n"
			desc+="Platinum ore:  "+Math.round(10*number/0.012)+" ("+Math.round(10*number/0.012/10000)/100+" mil)"+"\n\n"

			desc+="Time to refine with 1 refinery: "+Math.round(1205*number)+" seconds or "+Math.round(1205*number/60)+" minutes or "+Math.round(1205*number/3600)+" hours\n"
			desc+="Time to refine with 10 refineries: "+Math.round(120.5*number)+" seconds or "+Math.round(120.5*number/60)+" minutes or "+Math.round(120.5*number/3600)+" hours"
			if(number!=null){
				let embed = new Discord.MessageEmbed()
					.setTitle("Resources needed to make "+commandArgs[0]+" exotic tech with full yield elite refineries")
					.setDescription(desc);
				message.channel.send(embed)
			}
		}*/
		}
	}
});

client.login(credentials.bot_token);