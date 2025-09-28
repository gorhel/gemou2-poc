#!/usr/bin/env node

/**
 * Script pour vérifier la structure actuelle de la base de données cloud
 * et identifier les différences avec les migrations locales
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration des couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function colorize(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

function logSuccess(message) {
  console.log(colorize('green', `✅ ${message}`));
}

function logError(message) {
  console.log(colorize('red', `❌ ${message}`));
}

function logWarning(message) {
  console.log(colorize('yellow', `⚠️  ${message}`));
}

function logInfo(message) {
  console.log(colorize('blue', `ℹ️  ${message}`));
}

function logHeader(message) {
  console.log(colorize('cyan', `\n🎮 ${message}`));
  console.log('='.repeat(60));
}

function logTable(message) {
  console.log(colorize('magenta', `\n📊 ${message}`));
  console.log('-'.repeat(40));
}

// Fonction pour charger les variables d'environnement
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return env;
}

async function checkCloudStructure() {
  logHeader('Vérification de la Structure Cloud');
  
  // Charger les variables d'environnement
  const envPath = path.join(__dirname, '.env.local');
  const env = loadEnvFile(envPath);
  
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    logError('Variables d\'environnement Supabase non trouvées');
    logInfo('Vérifiez que .env.local contient NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }
  
  logSuccess('Variables d\'environnement Supabase trouvées');
  
  // Créer le client Supabase
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test de connexion
    logInfo('Test de connexion à Supabase...');
    
    // Récupérer la liste des tables
    logHeader('Tables Disponibles sur le Cloud');
    
    const tables = [
      'profiles', 'events', 'event_participants', 'event_applications', 
      'event_games', 'games', 'user_games', 'conversations', 
      'conversation_members', 'messages', 'reviews', 'marketplace_items',
      'contacts', 'notifications', 'tags', 'event_tags'
    ];
    
    const tableStructures = {};
    
    for (const tableName of tables) {
      try {
        logTable(`Vérification de la table: ${tableName}`);
        
        // Essayer de récupérer un enregistrement pour voir la structure
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.code === 'PGRST116') {
            logWarning(`Table ${tableName} n'existe pas`);
            continue;
          } else {
            logError(`Erreur pour ${tableName}: ${error.message}`);
            continue;
          }
        }
        
        // Si on a des données, analyser la structure
        if (data && data.length > 0) {
          const columns = Object.keys(data[0]);
          tableStructures[tableName] = columns;
          
          logSuccess(`${tableName} - ${columns.length} colonnes:`);
          columns.forEach(col => {
            console.log(`  • ${col}`);
          });
        } else {
          // Table vide, essayer de voir la structure via une requête SQL
          logInfo(`Table ${tableName} existe mais est vide`);
          tableStructures[tableName] = ['structure_non_determinable'];
        }
        
      } catch (err) {
        logError(`Erreur inattendue pour ${tableName}: ${err.message}`);
      }
    }
    
    // Vérifier spécifiquement les tables mentionnées par l'utilisateur
    logHeader('Vérifications Spécifiques');
    
    // 1. Vérifier user_games pour les colonnes supplémentaires
    if (tableStructures.user_games) {
      logTable('Table user_games - Colonnes détaillées');
      const { data: userGamesData, error: userGamesError } = await supabase
        .from('user_games')
        .select('*')
        .limit(5);
      
      if (!userGamesError && userGamesData && userGamesData.length > 0) {
        const sample = userGamesData[0];
        logSuccess('Structure actuelle de user_games:');
        Object.keys(sample).forEach(col => {
          const value = sample[col];
          const type = typeof value;
          console.log(`  • ${col}: ${type} (exemple: ${value})`);
        });
      }
    }
    
    // 2. Vérifier s'il y a une table messages_2
    logTable('Recherche de tables messages supplémentaires');
    const { data: messages2Data, error: messages2Error } = await supabase
      .from('messages_2')
      .select('*')
      .limit(1);
    
    if (!messages2Error) {
      logSuccess('Table messages_2 existe !');
      if (messages2Data && messages2Data.length > 0) {
        const columns = Object.keys(messages2Data[0]);
        logInfo('Colonnes de messages_2:');
        columns.forEach(col => {
          console.log(`  • ${col}`);
        });
      }
    } else {
      logWarning('Table messages_2 n\'existe pas');
    }
    
    // 3. Comparer messages et messages_2 si les deux existent
    if (tableStructures.messages && !messages2Error) {
      logTable('Comparaison messages vs messages_2');
      
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .limit(1);
      
      const { data: messages2DataCompare, error: messages2ErrorCompare } = await supabase
        .from('messages_2')
        .select('*')
        .limit(1);
      
      if (!messagesError && !messages2ErrorCompare) {
        const messagesCols = Object.keys(messagesData[0] || {});
        const messages2Cols = Object.keys(messages2DataCompare[0] || {});
        
        logInfo('Colonnes dans messages:');
        messagesCols.forEach(col => console.log(`  • ${col}`));
        
        logInfo('Colonnes dans messages_2:');
        messages2Cols.forEach(col => console.log(`  • ${col}`));
        
        // Trouver les différences
        const diff1 = messagesCols.filter(col => !messages2Cols.includes(col));
        const diff2 = messages2Cols.filter(col => !messagesCols.includes(col));
        
        if (diff1.length > 0) {
          logWarning('Colonnes dans messages mais pas dans messages_2:');
          diff1.forEach(col => console.log(`  • ${col}`));
        }
        
        if (diff2.length > 0) {
          logWarning('Colonnes dans messages_2 mais pas dans messages:');
          diff2.forEach(col => console.log(`  • ${col}`));
        }
        
        if (diff1.length === 0 && diff2.length === 0) {
          logSuccess('Les deux tables messages ont la même structure');
        }
      }
    }
    
    // Résumé final
    logHeader('Résumé de la Structure Cloud');
    
    const existingTables = Object.keys(tableStructures).filter(table => 
      tableStructures[table] !== undefined && 
      tableStructures[table] !== ['structure_non_determinable']
    );
    
    logSuccess(`Tables trouvées: ${existingTables.length}`);
    existingTables.forEach(table => {
      const colCount = tableStructures[table].length;
      console.log(`  • ${table}: ${colCount} colonnes`);
    });
    
    const missingTables = tables.filter(table => !existingTables.includes(table));
    if (missingTables.length > 0) {
      logWarning(`Tables manquantes: ${missingTables.length}`);
      missingTables.forEach(table => {
        console.log(`  • ${table}`);
      });
    }
    
  } catch (error) {
    logError(`Erreur inattendue: ${error.message}`);
    process.exit(1);
  }
}

// Exécuter la vérification
if (require.main === module) {
  checkCloudStructure().catch(error => {
    console.error(colorize('red', `Erreur fatale: ${error.message}`));
    process.exit(1);
  });
}

module.exports = { checkCloudStructure };
