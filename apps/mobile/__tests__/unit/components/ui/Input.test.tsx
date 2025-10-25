import React from 'react';
import { render, fireEvent, screen } from '../../../setup/helpers/render';
import { Input, Textarea } from '../../../../components/ui/Input';

describe('Input Component', () => {
  describe('Rendu de base', () => {
    it('devrait rendre un input de base', () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Entrez votre texte" />
      );
      expect(getByPlaceholderText('Entrez votre texte')).toBeTruthy();
    });

    it('devrait afficher un label', () => {
      const { getByText } = render(
        <Input label="Email" placeholder="email@example.com" />
      );
      expect(getByText('Email')).toBeTruthy();
    });

    it('devrait afficher un message d\'aide', () => {
      const { getByText } = render(
        <Input 
          placeholder="Email" 
          helperText="Nous ne partagerons jamais votre email" 
        />
      );
      expect(getByText('Nous ne partagerons jamais votre email')).toBeTruthy();
    });

    it('devrait afficher un message d\'erreur', () => {
      const { getByText } = render(
        <Input 
          placeholder="Email" 
          error="Email invalide" 
        />
      );
      expect(getByText('Email invalide')).toBeTruthy();
    });

    it('ne devrait pas afficher le helperText quand il y a une erreur', () => {
      const { getByText, queryByText } = render(
        <Input 
          placeholder="Email" 
          error="Email invalide"
          helperText="Message d'aide" 
        />
      );
      expect(getByText('Email invalide')).toBeTruthy();
      expect(queryByText('Message d\'aide')).toBeNull();
    });
  });

  describe('Tailles', () => {
    it('devrait appliquer la taille md par défaut', () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Medium input" />
      );
      const input = getByPlaceholderText('Medium input');
      expect(input.props.className).toContain('text-base');
    });

    it('devrait appliquer la taille sm', () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Small input" size="sm" />
      );
      const input = getByPlaceholderText('Small input');
      expect(input.props.className).toContain('text-sm');
    });

    it('devrait appliquer la taille lg', () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Large input" size="lg" />
      );
      const input = getByPlaceholderText('Large input');
      expect(input.props.className).toContain('text-lg');
    });
  });

  describe('Interactions utilisateur', () => {
    it('devrait gérer le changement de texte', () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <Input 
          placeholder="Type here" 
          onChangeText={onChangeText}
        />
      );
      
      const input = getByPlaceholderText('Type here');
      fireEvent.changeText(input, 'Hello World');
      
      expect(onChangeText).toHaveBeenCalledWith('Hello World');
    });

    it('devrait gérer le focus', () => {
      const onFocus = jest.fn();
      const { getByPlaceholderText } = render(
        <Input 
          placeholder="Focus me" 
          onFocus={onFocus}
        />
      );
      
      const input = getByPlaceholderText('Focus me');
      fireEvent(input, 'focus');
      
      expect(onFocus).toHaveBeenCalled();
    });

    it('devrait gérer le blur', () => {
      const onBlur = jest.fn();
      const { getByPlaceholderText } = render(
        <Input 
          placeholder="Blur me" 
          onBlur={onBlur}
        />
      );
      
      const input = getByPlaceholderText('Blur me');
      fireEvent(input, 'blur');
      
      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('États', () => {
    it('devrait être désactivé quand editable est false', () => {
      const { getByPlaceholderText } = render(
        <Input 
          placeholder="Disabled input" 
          editable={false}
        />
      );
      
      const input = getByPlaceholderText('Disabled input');
      expect(input.props.editable).toBe(false);
    });

    it('devrait appliquer les styles d\'erreur', () => {
      const { getByPlaceholderText } = render(
        <Input 
          placeholder="Error input" 
          error="Une erreur est survenue"
        />
      );
      
      const input = getByPlaceholderText('Error input');
      expect(input.props.className).toContain('border-red-300');
    });

    it('devrait être fullWidth', () => {
      const { getByPlaceholderText } = render(
        <Input 
          placeholder="Full width input" 
          fullWidth
        />
      );
      
      const input = getByPlaceholderText('Full width input');
      expect(input.props.className).toContain('w-full');
    });
  });

  describe('Icônes', () => {
    it('devrait afficher une icône à gauche', () => {
      const LeftIcon = () => <div testID="left-icon">Icon</div>;
      const { getByTestId } = render(
        <Input 
          placeholder="With left icon" 
          leftIcon={<LeftIcon />}
        />
      );
      
      expect(getByTestId('left-icon')).toBeTruthy();
    });

    it('devrait afficher une icône à droite', () => {
      const RightIcon = () => <div testID="right-icon">Icon</div>;
      const { getByTestId } = render(
        <Input 
          placeholder="With right icon" 
          rightIcon={<RightIcon />}
        />
      );
      
      expect(getByTestId('right-icon')).toBeTruthy();
    });

    it('devrait ajuster le padding avec les icônes', () => {
      const LeftIcon = () => <div>Icon</div>;
      const { getByPlaceholderText } = render(
        <Input 
          placeholder="With icon" 
          leftIcon={<LeftIcon />}
        />
      );
      
      const input = getByPlaceholderText('With icon');
      expect(input.props.className).toContain('pl-10');
    });
  });

  describe('Valeur par défaut', () => {
    it('devrait accepter une defaultValue', () => {
      const { getByDisplayValue } = render(
        <Input defaultValue="Valeur initiale" />
      );
      
      expect(getByDisplayValue('Valeur initiale')).toBeTruthy();
    });

    it('devrait accepter une value contrôlée', () => {
      const { getByDisplayValue } = render(
        <Input value="Valeur contrôlée" onChangeText={() => {}} />
      );
      
      expect(getByDisplayValue('Valeur contrôlée')).toBeTruthy();
    });
  });
});

describe('Textarea Component', () => {
  describe('Rendu de base', () => {
    it('devrait rendre un textarea', () => {
      const { getByPlaceholderText } = render(
        <Textarea placeholder="Entrez votre message" />
      );
      
      const textarea = getByPlaceholderText('Entrez votre message');
      expect(textarea).toBeTruthy();
      expect(textarea.props.multiline).toBe(true);
    });

    it('devrait afficher un label', () => {
      const { getByText } = render(
        <Textarea label="Message" placeholder="Votre message" />
      );
      
      expect(getByText('Message')).toBeTruthy();
    });

    it('devrait définir le nombre de lignes', () => {
      const { getByPlaceholderText } = render(
        <Textarea placeholder="Message" rows={6} />
      );
      
      const textarea = getByPlaceholderText('Message');
      expect(textarea.props.numberOfLines).toBe(6);
    });

    it('devrait avoir 4 lignes par défaut', () => {
      const { getByPlaceholderText } = render(
        <Textarea placeholder="Message" />
      );
      
      const textarea = getByPlaceholderText('Message');
      expect(textarea.props.numberOfLines).toBe(4);
    });
  });

  describe('Interactions', () => {
    it('devrait gérer le changement de texte', () => {
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <Textarea 
          placeholder="Type here" 
          onChangeText={onChangeText}
        />
      );
      
      const textarea = getByPlaceholderText('Type here');
      fireEvent.changeText(textarea, 'Multi-line\ntext');
      
      expect(onChangeText).toHaveBeenCalledWith('Multi-line\ntext');
    });
  });

  describe('États', () => {
    it('devrait afficher une erreur', () => {
      const { getByText } = render(
        <Textarea 
          placeholder="Message" 
          error="Le message est trop court"
        />
      );
      
      expect(getByText('Le message est trop court')).toBeTruthy();
    });

    it('devrait être fullWidth', () => {
      const { getByPlaceholderText } = render(
        <Textarea 
          placeholder="Full width textarea" 
          fullWidth
        />
      );
      
      const textarea = getByPlaceholderText('Full width textarea');
      expect(textarea.props.className).toContain('w-full');
    });

    it('devrait être désactivé', () => {
      const { getByPlaceholderText } = render(
        <Textarea 
          placeholder="Disabled" 
          editable={false}
        />
      );
      
      const textarea = getByPlaceholderText('Disabled');
      expect(textarea.props.editable).toBe(false);
    });
  });

  describe('Alignement du texte', () => {
    it('devrait aligner le texte en haut', () => {
      const { getByPlaceholderText } = render(
        <Textarea placeholder="Message" />
      );
      
      const textarea = getByPlaceholderText('Message');
      expect(textarea.props.textAlignVertical).toBe('top');
    });
  });
});




