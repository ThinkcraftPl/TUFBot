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
	iron: Sequelize.INTEGER,
	silicon: Sequelize.INTEGER,
	nickel: Sequelize.INTEGER,
	cobalt: Sequelize.INTEGER,
	silver: Sequelize.INTEGER,
	gold: Sequelize.INTEGER,
	uranium: Sequelize.INTEGER,
	platinum: Sequelize.INTEGER,
	magnesium: Sequelize.INTEGER,
	tech2x: Sequelize.INTEGER,
	tech4x: Sequelize.INTEGER,
	tech8x: Sequelize.INTEGER,
	assembletime: Sequelize.FLOAT,
});
Component.sync({ alter: true });
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
						iron: parseInt(commandArgs[1]),
						silicon: parseInt(commandArgs[2]),
						nickel: parseInt(commandArgs[3]),
						cobalt: parseInt(commandArgs[4]),
						silver: parseInt(commandArgs[5]),
						gold: parseInt(commandArgs[6]),
						uranium: parseInt(commandArgs[7]),
						platinum: parseInt(commandArgs[8]),
						magnesium: parseInt(commandArgs[9]),
						tech2x: parseInt(commandArgs[10]),
						tech4x: parseInt(commandArgs[11]),
						tech8x: parseInt(commandArgs[12]),
						assembletime: parseFloat(commandArgs[13]),
					});
				}
				catch (e) {
					console.log(e)
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