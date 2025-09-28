import { NextRequest, NextResponse } from 'next/server';

// Service pour rechercher des jeux dans BoardGameGeek
class BoardGameGeekSearchService {
  private baseUrl = 'https://boardgamegeek.com/xmlapi2';

  // Rechercher des jeux par nom
  async searchGames(query: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?query=${encodeURIComponent(query)}&type=boardgame`,
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
      
      const items = xmlDoc.getElementsByTagName('item');
      const games = [];

      for (let i = 0; i < Math.min(items.length, limit); i++) {
        const item = items[i];
        const gameId = item.getAttribute('id');
        const name = item.getElementsByTagName('name')[0]?.getAttribute('value') || '';
        const yearPublished = item.getElementsByTagName('yearpublished')[0]?.getAttribute('value') || '';

        if (gameId && name) {
          // Récupérer les détails du jeu
          const gameDetails = await this.getGameDetails(gameId);
          if (gameDetails) {
            games.push(gameDetails);
          }
        }
      }

      return games;
    } catch (error) {
      console.error('Error searching games:', error);
      return [];
    }
  }

  // Récupérer les détails d'un jeu
  private async getGameDetails(gameId: string): Promise<any | null> {
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
        return null;
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
}

const boardGameGeekSearchService = new BoardGameGeekSearchService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const games = await boardGameGeekSearchService.searchGames(query, limit);
    
    return NextResponse.json({ games });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche de jeux' },
      { status: 500 }
    );
  }
}
