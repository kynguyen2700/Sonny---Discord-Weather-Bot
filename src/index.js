require('dotenv').config();
const Discord = require('discord.js');
const {Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, PermissionsBitField, Permissions} = require('discord.js');
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});
const axios = require('axios').default;

client.on("ready", (x) => {
    console.log(`${x.user.tag} is ready!`);
    client.user.setActivity(`In The Rain!`);

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

client.on('interactionCreate', async (interaction) => {
    if(!interaction.isChatInputCommand()) return;
    if(interaction.commandName==='weather'){
        var city = interaction.options.getString('cityname');
        city = city.split(' ').join('+');
        
        let getWeather = async () => {
            let response = await axios.get(
                "https://api.openweathermap.org/data/2.5/weather?q="+city+"&units=imperial&appid=8a106dfe29cfdf1b3ccafa4a6589b2e8"
            );
            let weather = response.data;
            return weather;
        };

        let randColor = "#" + Math.floor(Math.random()*16777215).toString(16);
        let weatherValue = await getWeather();
        console.log(weatherValue);
        interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor(randColor)
                .setAuthor({name: client.user.tag, iconURL: 'https://i.imgur.com/m5qmXwy.png'})
                .setTitle(`__${weatherValue.name} (${weatherValue.sys.country})__`)
                .setDescription(`The is the current weather forecast for ${weatherValue.name} (${weatherValue.sys.country})`)
                .addFields(
                    { name: 'Temperature', value: `${weatherValue.main.temp.toFixed()}°F`, inline: true},
                    { name: 'Feels Like', value: `${weatherValue.main.feels_like.toFixed()}°F`, inline: true},
                    { name: 'Current Conditions', value: `${weatherValue.weather[0].description}`},
                    { name: 'Wind Speed', value: `${weatherValue.wind.speed} MPH`, inline: true},
		            { name: 'Humidity', value: `${weatherValue.main.humidity}%`},
                )
                .setThumbnail(`https://openweathermap.org/img/wn/${weatherValue.weather[0].icon}.png`)
                .setTimestamp()
                .setFooter({text: 'Made by Ya Boi Kevo', iconURL: 'https://i.imgur.com/m5qmXwy.png'})
            ]
        });
    }
});
client.login(process.env.TOKEN);