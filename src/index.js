require('dotenv').config();
const {Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, PermissionsBitField, Permissions} = require('discord.js');
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});
const axios = require('axios').default;

client.on("ready", (x) => {
    console.log(`${x.user.tag} is ready!`);
    client.user.setActivity(`in the rain`);

    const weather = new SlashCommandBuilder()
    .setName ('weather')
    .setDescription('This is a weather forecast command!')
    .addStringOption((option) => option
        .setName('cityname')
        .setDescription('This is the city you want to know the weather for')
        .setRequired(true)
        )
                

    client.application.commands.create(weather);

})

client.on('interactionCreate', async (interaction) => {
    if(!interaction.isChatInputCommand()) return;
    if(interaction.commandName==='weather'){
        const city = interaction.options.getString('cityname');

        let getWeather = async () => {
            let response = await axios.get(
                "https://api.openweathermap.org/data/2.5/weather?q="+city+"&units=imperial&appid=8a106dfe29cfdf1b3ccafa4a6589b2e8"
            );
            let weather = response.data;
            return weather;
        };
        let weatherValue = await getWeather();
        console.log(weatherValue);

        interaction.reply(`Weather in ${weatherValue.name} \n\n The temperature outside is ${weatherValue.main.temp.toFixed()}`);
    }

})
client.login(process.env.TOKEN);