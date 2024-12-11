const { Client, GatewayIntentBits, SlashCommandBuilder } = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

// Create a single client with proper intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,             // For handling server events
        GatewayIntentBits.GuildMessages,     // For handling messages in servers
        GatewayIntentBits.MessageContent,    // To read the content of messages
    ]
});

// Login the bot
client.login(process.env.DISCORD_TOKEN);

// Event listener for when the bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Handle incoming messages
client.on("messageCreate", (message) => {
    if (message.author.bot) return; // Ignore bot messages
    if (message.mentions.has(client.user)) {
        let msg = message.content;
        const arr = msg.split(" ");
        arr.shift(); // Remove the bot mention
        const ques = joiner(arr);

        (async () => {
            const result = await gemini(ques);
            message.reply({
                content: result,
            });
        })();
    }
});

// Utility function to join words into a sentence
const joiner = (words) => {
    return words.join(" ");
};

// Gemini API Integration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const gemini = async (ques) => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `${ques}? Reply to the question in as few words as possible, ideally under 100 words.`;
    const result = await model.generateContent(prompt);
    return result.response.text() || "Sorry, I couldn't process that.";
};
