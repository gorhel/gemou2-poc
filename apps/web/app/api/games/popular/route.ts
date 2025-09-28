import { NextRequest, NextResponse } from 'next/server';

// Service pour interagir avec l'API BoardGameGeek côté serveur
// Documentation: https://boardgamegeek.com/xmlapi2/

interface BoardGame {
  id: string;
  name: string;
  yearPublished: string;
  minPlayers: number;
  maxPlayers: number;
  playingTime: number;
  minAge: number;
  description: string;
  image: string;
  thumbnail: string;
  categories: string[];
  mechanics: string[];
  designers: string[];
  artists: string[];
  publishers: string[];
  averageRating: number;
  usersRated: number;
  rank: number;
  complexity: number;
}

class BoardGameGeekService {
  private baseUrl = 'https://boardgamegeek.com/xmlapi2';

  // Récupérer les détails d'un jeu
  async getGameDetails(gameId: string): Promise<BoardGame | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/boardgame/${gameId}?stats=1`,
        {
          headers: {
            'User-Agent': 'Gémou2/1.0 (https://gemou2.com)',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      const game = xmlDoc.getElementsByTagName('boardgame')[0];
      if (!game) return null;

      const name = game.getElementsByTagName('name')[0]?.getAttribute('value') || '';
      const yearPublished = game.getElementsByTagName('yearpublished')[0]?.textContent || '';
      const minPlayers = parseInt(game.getElementsByTagName('minplayers')[0]?.textContent || '0');
      const maxPlayers = parseInt(game.getElementsByTagName('maxplayers')[0]?.textContent || '0');
      const playingTime = parseInt(game.getElementsByTagName('playingtime')[0]?.textContent || '0');
      const minAge = parseInt(game.getElementsByTagName('minage')[0]?.textContent || '0');
      const description = game.getElementsByTagName('description')[0]?.textContent || '';
      const image = game.getElementsByTagName('image')[0]?.textContent || '';
      const thumbnail = game.getElementsByTagName('thumbnail')[0]?.textContent || '';

      // Récupérer les catégories
      const categories: string[] = [];
      const categoryElements = game.getElementsByTagName('boardgamecategory');
      for (let i = 0; i < categoryElements.length; i++) {
        const category = categoryElements[i].getAttribute('value');
        if (category) categories.push(category);
      }

      // Récupérer les mécaniques
      const mechanics: string[] = [];
      const mechanicElements = game.getElementsByTagName('boardgamemechanic');
      for (let i = 0; i < mechanicElements.length; i++) {
        const mechanic = mechanicElements[i].getAttribute('value');
        if (mechanic) mechanics.push(mechanic);
      }

      // Récupérer les designers
      const designers: string[] = [];
      const designerElements = game.getElementsByTagName('boardgamedesigner');
      for (let i = 0; i < designerElements.length; i++) {
        const designer = designerElements[i].getAttribute('value');
        if (designer) designers.push(designer);
      }

      // Récupérer les artistes
      const artists: string[] = [];
      const artistElements = game.getElementsByTagName('boardgameartist');
      for (let i = 0; i < artistElements.length; i++) {
        const artist = artistElements[i].getAttribute('value');
        if (artist) artists.push(artist);
      }

      // Récupérer les éditeurs
      const publishers: string[] = [];
      const publisherElements = game.getElementsByTagName('boardgamepublisher');
      for (let i = 0; i < publisherElements.length; i++) {
        const publisher = publisherElements[i].getAttribute('value');
        if (publisher) publishers.push(publisher);
      }

      // Récupérer les statistiques
      const stats = game.getElementsByTagName('statistics')[0];
      const ratings = stats?.getElementsByTagName('ratings')[0];
      const averageRating = parseFloat(ratings?.getElementsByTagName('average')[0]?.getAttribute('value') || '0');
      const usersRated = parseInt(ratings?.getElementsByTagName('usersrated')[0]?.getAttribute('value') || '0');
      const rank = parseInt(ratings?.getElementsByTagName('rank')[0]?.getAttribute('value') || '0');
      const complexity = parseFloat(ratings?.getElementsByTagName('averageweight')[0]?.getAttribute('value') || '0');

      return {
        id: gameId,
        name,
        yearPublished,
        minPlayers,
        maxPlayers,
        playingTime,
        minAge,
        description: this.cleanDescription(description),
        image,
        thumbnail,
        categories,
        mechanics,
        designers,
        artists,
        publishers,
        averageRating,
        usersRated,
        rank,
        complexity
      };
    } catch (error) {
      console.error(`Error fetching game details for ${gameId}:`, error);
      return null;
    }
  }

  // Nettoyer la description HTML
  private cleanDescription(description: string): string {
    return description
      .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
      .replace(/&quot;/g, '"') // Remplacer les entités HTML
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .trim();
  }

  // Mélanger un tableau
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Rechercher des jeux populaires
  async getPopularGames(limit: number = 10): Promise<BoardGame[]> {
    try {
      // Utiliser une liste de jeux populaires connus pour avoir des résultats cohérents
      const popularGameIds = [
        '174430', // Gloomhaven
        '161936', // Pandemic Legacy: Season 1
        '266192', // Wingspan
        '167791', // Terraforming Mars
        '230802', // Azul
        '266810', // Everdell
        '266524', // Root
        '224517', // Brass: Birmingham
        '266524', // Root
        '266192', // Wingspan
        '266192', // Wingspan
        '266192', // Wingspan
        '266192', // Wingspan
        '266192', // Wingspan
        '266192', // Wingspan
        '266192', // Wingspan
        '266192', // Wingspan
        '266192', // Wingspan
        '266192', // Wingspan
        '266192', // Wingspan
      ];

      // Mélanger et prendre les premiers
      const shuffledIds = this.shuffleArray([...popularGameIds]).slice(0, limit);
      
      // Récupérer les détails de chaque jeu
      const games = await Promise.all(
        shuffledIds.map(id => this.getGameDetails(id))
      );

      return games.filter(game => game !== null) as BoardGame[];
    } catch (error) {
      console.error('Error fetching popular games:', error);
      return [];
    }
  }
}

const boardGameGeekService = new BoardGameGeekService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const games = await boardGameGeekService.getPopularGames(limit);
    
    return NextResponse.json({ games });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des jeux' },
      { status: 500 }
    );
  }
}

