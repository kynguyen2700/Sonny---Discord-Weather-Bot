require('dotenv').config();
const Discord = require('discord.js');
const mongoose = require("mongoose");
const {Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, PermissionsBitField, Permissions, ActivityType} = require('discord.js');
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});
const axios = require('axios').default;

const interactionCountSchema = require("./interaction-count-schema")

client.on("ready", async (x) => {
    console.log(`${x.user.tag} is ready!`);

    mongoose.connect(process.env.MONGO_URI || '',{
    }).then(()=>{
        console.log('Connected to the database!');
    }).catch((err) =>{
        console.log(err);
    });

    client.user.setPresence({
        activities: [{ name: `clouds in ${client.guilds.cache.size} servers!`, type: ActivityType.Watching }],
        status: 'online',
    });

    const weather = new SlashCommandBuilder()
    .setName ('weather')
    .setDescription('This is a weather forecast command!')
    .addStringOption((option) => option
        .setName('cityname')
        .setDescription('This is the city you want to know the weather for')
        .setRequired(true)
        );
                

    client.application.commands.create(weather);

});


client.on("interactionCreate", async (interaction) => {
    if(!interaction.isChatInputCommand()) return;
    if(interaction.commandName==='weather'){
        //Get the name of the city from user input
        var city = interaction.options.getString('cityname');
        city = city.split(' ').join('+');

        const today = new Date();
        const time = today.getHours();
        
        //Waiting for Open Weather API to pass city forecast information as .json
        let getWeather = async () => {
            let response = await axios.get(
                "https://api.openweathermap.org/data/2.5/weather?q="+city+"&units=imperial&appid=8a106dfe29cfdf1b3ccafa4a6589b2e8"
            );
            let weather = response.data;
            return weather;
        };

        
        let weatherValue = await getWeather();
        console.log(weatherValue);
        let randColor = "#" + Math.floor(Math.random()*16777215).toString(16);
        
        //Getting help quote
        var HelpQuote;
        if(time >= 6 && time <= 17){
            if(weatherValue.wind.speed.toFixed() > 30){
                HelpQuote = "Hold on tight it's windy outside! :wind_blowing_face:"; 
            }
            else if(weatherValue.weather[0].main == 'Thunderstorm'){
                HelpQuote = "Be careful! It's thundering outside and you might need an umbrella! :thunder_cloud_rain: :closed_umbrella:"; 
            }

            else if(weatherValue.weather[0].main == 'Drizzle' || weatherValue.weather[0].main === 'Rain'){
                HelpQuote = "Be sure to bring an umbrella! :umbrella:"; 
            }
            else if(weatherValue.weather[0].main == 'Snow'){
                HelpQuote = "Time to build some snowmen! :snowman2: :snowflake:";
            }
            else if(weatherValue.weather[0].main == 'Mist' || weatherValue.weather[0].main == 'Fog'){
                HelpQuote = "Watch your step! :Fog:"; 
            }
            else if(weatherValue.weather[0].main == 'Clouds'){
                HelpQuote = "Sonny is trying to hide :face_in_clouds:"; 
            }
            else if(weatherValue.weather[0].main == 'Clear'){
                if(weatherValue.main.temp.toFixed() >= 80){
                    HelpQuote = "Don't forget your sunscreen! :sunglasses:"; 
                }
                else if(weatherValue.main.temp.toFixed() < 80 && weatherValue.main.temp.toFixed() >= 69){
                    HelpQuote = "What a beautiful day! :relaxed:"; 
                }
                else{
                    HelpQuote = "It's a bit chilly outside don't forget to wear a jacket! :cold_face:";
                }
            }
            else{
                HelpQuote = "It might not be a good idea to go outside... :mask:"; 
            }
        }
        else{
            HelpQuote = "Sonny is off-duty... :sleeping: :zzz:"; 
        }

        //Store user data in MongoDB regarding how many types a specific user calls the weather command
        await interactionCountSchema.findOneAndUpdate(
        {
            _id:interaction.user.id
        }, 
        {
            _id: interaction.user.id,
            $inc: {
                interactionCount: 1
            }
        }, 
        {
            upsert: true
        });

        //Reply with embed and weather forecast for the requested city
        interaction.reply({ 
            embeds: [new EmbedBuilder()
                .setColor(randColor)
                .setAuthor({name: client.user.tag, iconURL: 'https://i.imgur.com/m5qmXwy.png'})
                .setTitle(`__${weatherValue.name} (${weatherValue.sys.country})__`)
                .setDescription(`The is the current weather forecast for ${weatherValue.name} (${weatherValue.sys.country})\n${HelpQuote}`)
                .addFields(
                    { name: 'Temperature', value: `${weatherValue.main.temp.toFixed()}°F`, inline: true},
                    { name: 'Feels Like', value: `${weatherValue.main.feels_like.toFixed()}°F`, inline: true},
                    { name: 'Current Conditions', value: `${weatherValue.weather[0].description}`},
                    { name: 'Wind Speed', value: `${weatherValue.wind.speed} MPH`, inline: true},
                    { name: 'Humidity', value: `${weatherValue.main.humidity}%`, inline: true},
                )
                .setThumbnail(`https://openweathermap.org/img/wn/${weatherValue.weather[0].icon}.png`)
                .setTimestamp()
                .setFooter({text: 'Made by Ya Boi Kevo', iconURL: 'https://i.imgur.com/m5qmXwy.png'})
            ]
        });
    }
});
client.login(process.env.TOKEN);

