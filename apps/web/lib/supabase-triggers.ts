// Fonction pour synchroniser le pseudo lors de l'inscription
export async function syncUsernameToProfile(
  supabase: any,
  userId: string,
  username: string
) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ username: username.toLowerCase() })
      .eq('id', userId);

    if (error) {
      console.error('Erreur lors de la synchronisation du pseudo:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur dans syncUsernameToProfile:', error);
    throw error;
  }
}

// Fonction pour vérifier l'unicité du pseudo
export async function checkUsernameAvailability(
  supabase: any,
  username: string
): Promise<{ available: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data) {
      return { available: false, error: 'Ce pseudo est déjà pris' };
    }

    return { available: true };
  } catch (error) {
    console.error('Erreur lors de la vérification du pseudo:', error);
    return { available: false, error: 'Erreur de vérification' };
  }
}

