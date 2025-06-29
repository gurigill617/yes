import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { pathToFileURL } from 'url'; // ✅ Add this line
config();

const configJson = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const commands = [];

const commandsPath = path.join(process.cwd(), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);

  // ✅ Convert filePath to file:// URL
  const command = await import(pathToFileURL(filePath).href);

  if (command?.default?.data) {
    commands.push(command.default.data.toJSON());
  } else {
    console.warn(`⚠️ Skipped ${file} — missing valid export.`);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

try {
  console.log('🌀 Refreshing slash commands...');
  await rest.put(
    Routes.applicationGuildCommands(configJson.clientId, configJson.guildId),
    { body: commands }
  );
  console.log('✅ Slash commands deployed!');
} catch (error) {
  console.error('❌ Failed to deploy commands:', error);
}
