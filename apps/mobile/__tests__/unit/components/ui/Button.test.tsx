import React from 'react';
import { render, fireEvent, screen } from '../../../setup/helpers/render';
import { Button } from '../../../../components/ui/Button';

describe('Button Component', () => {
  describe('Rendu de base', () => {
    it('devrait afficher le texte du bouton', () => {
      render(<Button>Cliquez ici</Button>);
      expect(screen.getByText('Cliquez ici')).toBeTruthy();
    });

    it('devrait afficher un loader quand loading est true', () => {
      render(<Button loading>Cliquez ici</Button>);
      expect(screen.queryByText('Cliquez ici')).toBeNull();
      expect(screen.getByTestId('activity-indicator')).toBeTruthy();
    });

    it('devrait être accessible', () => {
      const { getByText } = render(<Button>Accessible Button</Button>);
      expect(getByText('Accessible Button')).toBeTruthy();
    });
  });

  describe('Variants de style', () => {
    it('devrait appliquer les styles primary par défaut', () => {
      const { getByText } = render(<Button>Primary</Button>);
      const button = getByText('Primary').parent;
      
      const styles = Array.isArray(button?.props.style) 
        ? button.props.style.flat() 
        : [button?.props.style];
      
      const hasBlueBackground = styles.some(
        (style: any) => style?.backgroundColor === '#3b82f6'
      );
      expect(hasBlueBackground).toBe(true);
    });

    it('devrait appliquer les styles secondary', () => {
      const { getByText } = render(<Button variant="secondary">Secondary</Button>);
      const button = getByText('Secondary').parent;
      
      const styles = Array.isArray(button?.props.style) 
        ? button.props.style.flat() 
        : [button?.props.style];
      
      const hasGrayBackground = styles.some(
        (style: any) => style?.backgroundColor === '#f3f4f6'
      );
      expect(hasGrayBackground).toBe(true);
    });

    it('devrait appliquer les styles danger', () => {
      const { getByText } = render(<Button variant="danger">Danger</Button>);
      const button = getByText('Danger').parent;
      
      const styles = Array.isArray(button?.props.style) 
        ? button.props.style.flat() 
        : [button?.props.style];
      
      const hasRedBackground = styles.some(
        (style: any) => style?.backgroundColor === '#ef4444'
      );
      expect(hasRedBackground).toBe(true);
    });

    it('devrait appliquer les styles ghost', () => {
      const { getByText } = render(<Button variant="ghost">Ghost</Button>);
      const button = getByText('Ghost').parent;
      
      const styles = Array.isArray(button?.props.style) 
        ? button.props.style.flat() 
        : [button?.props.style];
      
      const hasTransparentBackground = styles.some(
        (style: any) => style?.backgroundColor === 'transparent'
      );
      expect(hasTransparentBackground).toBe(true);
    });
  });

  describe('Tailles', () => {
    it('devrait appliquer la taille sm', () => {
      const { getByText } = render(<Button size="sm">Small</Button>);
      const button = getByText('Small').parent;
      
      const styles = Array.isArray(button?.props.style) 
        ? button.props.style.flat() 
        : [button?.props.style];
      
      const hasSmallPadding = styles.some(
        (style: any) => style?.paddingVertical === 8
      );
      expect(hasSmallPadding).toBe(true);
    });

    it('devrait appliquer la taille md par défaut', () => {
      const { getByText } = render(<Button>Medium</Button>);
      const button = getByText('Medium').parent;
      
      const styles = Array.isArray(button?.props.style) 
        ? button.props.style.flat() 
        : [button?.props.style];
      
      const hasMediumPadding = styles.some(
        (style: any) => style?.paddingVertical === 12
      );
      expect(hasMediumPadding).toBe(true);
    });

    it('devrait appliquer la taille lg', () => {
      const { getByText } = render(<Button size="lg">Large</Button>);
      const button = getByText('Large').parent;
      
      const styles = Array.isArray(button?.props.style) 
        ? button.props.style.flat() 
        : [button?.props.style];
      
      const hasLargePadding = styles.some(
        (style: any) => style?.paddingVertical === 16
      );
      expect(hasLargePadding).toBe(true);
    });
  });

  describe('Interactions utilisateur', () => {
    it('devrait appeler onPress au clic', () => {
      const onPress = jest.fn();
      const { getByText } = render(<Button onPress={onPress}>Cliquez</Button>);
      
      fireEvent.press(getByText('Cliquez'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('ne devrait pas appeler onPress si disabled', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <Button onPress={onPress} disabled>
          Désactivé
        </Button>
      );
      
      fireEvent.press(getByText('Désactivé'));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('ne devrait pas appeler onPress si loading', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(<Button onPress={onPress} loading>Loading</Button>);
      
      const indicator = getByTestId('activity-indicator');
      const button = indicator.parent?.parent;
      
      if (button) {
        fireEvent.press(button);
      }
      
      expect(onPress).not.toHaveBeenCalled();
    });

    it('devrait avoir le bon état disabled', () => {
      const { getByText } = render(<Button disabled>Désactivé</Button>);
      const button = getByText('Désactivé').parent;
      expect(button?.props.disabled).toBe(true);
    });
  });

  describe('Props fullWidth', () => {
    it('devrait occuper toute la largeur quand fullWidth est true', () => {
      const { getByText } = render(<Button fullWidth>Full Width</Button>);
      const button = getByText('Full Width').parent;
      
      const styles = Array.isArray(button?.props.style) 
        ? button.props.style.flat() 
        : [button?.props.style];
      
      const hasFullWidth = styles.some(
        (style: any) => style?.width === '100%'
      );
      expect(hasFullWidth).toBe(true);
    });
  });

  describe('Styles personnalisés', () => {
    it('devrait accepter des styles personnalisés', () => {
      const customStyle = { marginTop: 20 };
      const { getByText } = render(
        <Button style={customStyle}>Custom Style</Button>
      );
      const button = getByText('Custom Style').parent;
      
      const styles = Array.isArray(button?.props.style) 
        ? button.props.style.flat() 
        : [button?.props.style];
      
      const hasCustomStyle = styles.some(
        (style: any) => style?.marginTop === 20
      );
      expect(hasCustomStyle).toBe(true);
    });
  });
});






