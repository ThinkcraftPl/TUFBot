const Discord = require('discord.js');
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
Ore.sync();
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
			var desc="Name | Fe | Si | Ni | Co | Ag | Au | Ur | Pl | Mg | 2x | 4x | 8x | assembletime\n";
			(comps).forEach(element => {
				desc+=element.name+" | "+element.iron+" | "+element.silicon+" | "+element.nickel+" | "+element.cobalt+" | "+element.silver+" | "+element.gold+" | "+element.uranium+" | "+element.platinum+" | "+element.magnesium+" | "+element.tech2x+" | "+element.tech4x+" | "+element.tech8x+" | "+element.assembletime+"\n";
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
					const ore = await Ores.create({
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
		}
		if (command === 'common') {
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
		}
	}
});

client.login(credentials.bot_token);