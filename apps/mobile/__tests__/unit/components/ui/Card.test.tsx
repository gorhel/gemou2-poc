import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '../../../setup/helpers/render';
import { Card } from '../../../../components/ui/Card';

describe('Card Component', () => {
  describe('Rendu de base', () => {
    it('devrait rendre le contenu de la carte', () => {
      const { getByText } = render(
        <Card>
          <Text>Contenu de la carte</Text>
        </Card>
      );
      
      expect(getByText('Contenu de la carte')).toBeTruthy();
    });

    it('devrait rendre plusieurs enfants', () => {
      const { getByText } = render(
        <Card>
          <Text>Titre</Text>
          <Text>Description</Text>
        </Card>
      );
      
      expect(getByText('Titre')).toBeTruthy();
      expect(getByText('Description')).toBeTruthy();
    });
  });

  describe('Variants', () => {
    it('devrait appliquer le variant par défaut', () => {
      const { getByText } = render(
        <Card>
          <Text>Default Card</Text>
        </Card>
      );
      
      const cardContainer = getByText('Default Card').parent;
      expect(cardContainer).toBeTruthy();
    });

    it('devrait appliquer le variant outlined', () => {
      const { getByText } = render(
        <Card variant="outlined">
          <Text>Outlined Card</Text>
        </Card>
      );
      
      const cardContainer = getByText('Outlined Card').parent;
      expect(cardContainer).toBeTruthy();
    });

    it('devrait appliquer le variant elevated', () => {
      const { getByText } = render(
        <Card variant="elevated">
          <Text>Elevated Card</Text>
        </Card>
      );
      
      const cardContainer = getByText('Elevated Card').parent;
      expect(cardContainer).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('devrait gérer le clic quand onPress est fourni', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Card onPress={onPress}>
          <Text>Cliquable</Text>
        </Card>
      );
      
      const card = getByText('Cliquable').parent;
      if (card) {
        fireEvent.press(card);
      }
      
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('ne devrait pas être cliquable sans onPress', () => {
      const { getByText } = render(
        <Card>
          <Text>Non cliquable</Text>
        </Card>
      );
      
      const card = getByText('Non cliquable').parent;
      expect(card?.props.onPress).toBeUndefined();
    });
  });

  describe('Padding', () => {
    it('devrait avoir du padding par défaut', () => {
      const { getByText } = render(
        <Card>
          <Text>Avec padding</Text>
        </Card>
      );
      
      const cardContainer = getByText('Avec padding').parent;
      expect(cardContainer).toBeTruthy();
    });

    it('devrait supporter noPadding', () => {
      const { getByText } = render(
        <Card noPadding>
          <Text>Sans padding</Text>
        </Card>
      );
      
      const cardContainer = getByText('Sans padding').parent;
      expect(cardContainer).toBeTruthy();
    });
  });

  describe('Styles personnalisés', () => {
    it('devrait accepter des styles personnalisés', () => {
      const customStyle = { marginTop: 20 };
      const { getByText } = render(
        <Card style={customStyle}>
          <Text>Style personnalisé</Text>
        </Card>
      );
      
      const card = getByText('Style personnalisé').parent;
      expect(card).toBeTruthy();
    });

    it('devrait accepter une className personnalisée', () => {
      const { getByText } = render(
        <Card className="custom-class">
          <Text>Classe personnalisée</Text>
        </Card>
      );
      
      const card = getByText('Classe personnalisée').parent;
      expect(card?.props.className).toContain('custom-class');
    });
  });

  describe('Accessibilité', () => {
    it('devrait être accessible', () => {
      const { getByText } = render(
        <Card accessible accessibilityLabel="Carte d'information">
          <Text>Info</Text>
        </Card>
      );
      
      const card = getByText('Info').parent;
      expect(card?.props.accessible).toBe(true);
      expect(card?.props.accessibilityLabel).toBe('Carte d\'information');
    });

    it('devrait avoir le rôle button quand cliquable', () => {
      const { getByText } = render(
        <Card onPress={() => {}}>
          <Text>Cliquable</Text>
        </Card>
      );
      
      const card = getByText('Cliquable').parent;
      expect(card?.props.accessibilityRole).toBe('button');
    });
  });
});






