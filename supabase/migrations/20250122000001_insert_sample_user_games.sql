-- Migration pour ajouter des jeux d'exemple aux utilisateurs
-- Cette migration ajoute quelques jeux à la collection de chaque utilisateur

-- Insérer des jeux pour les utilisateurs existants
INSERT INTO public.user_games (user_id, game_id, game_name, game_thumbnail, game_image, year_published, min_players, max_players) VALUES
-- Marie Dupont
('11111111-1111-1111-1111-111111111111', '13', 'Catan', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 1995, 3, 4),
('11111111-1111-1111-1111-111111111111', '266192', 'Wingspan', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 2019, 1, 5),
('11111111-1111-1111-1111-111111111111', '167791', 'Terraforming Mars', 'https://cf.geekdo-images.com/thumb/img/9aMzUIbDjkDaxI4B9B3bS7iGdSk=/fit-in/200x150/pic3536616.jpg', 'https://cf.geekdo-images.com/thumb/img/9aMzUIbDjkDaxI4B9B3bS7iGdSk=/fit-in/200x150/pic3536616.jpg', 2016, 1, 5),

-- Pierre Martin
('22222222-2222-2222-2222-222222222222', '174430', 'Gloomhaven', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 2017, 1, 4),
('22222222-2222-2222-2222-222222222222', '182028', 'Through the Ages: A New Story of Civilization', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 2015, 2, 4),
('22222222-2222-2222-2222-222222222222', '224517', 'Brass: Birmingham', 'https://cf.geekdo-images.com/thumb/img/9aMzUIbDjkDaxI4B9B3bS7iGdSk=/fit-in/200x150/pic3536616.jpg', 'https://cf.geekdo-images.com/thumb/img/9aMzUIbDjkDaxI4B9B3bS7iGdSk=/fit-in/200x150/pic3536616.jpg', 2018, 2, 4),

-- Sophie Bernard
('33333333-3333-3333-3333-333333333333', '13', 'Catan', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 1995, 3, 4),
('33333333-3333-3333-3333-333333333333', '266192', 'Wingspan', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 2019, 1, 5),
('33333333-3333-3333-3333-333333333333', '161936', 'Pandemic Legacy: Season 1', 'https://cf.geekdo-images.com/thumb/img/9aMzUIbDjkDaxI4B9B3bS7iGdSk=/fit-in/200x150/pic3536616.jpg', 'https://cf.geekdo-images.com/thumb/img/9aMzUIbDjkDaxI4B9B3bS7iGdSk=/fit-in/200x150/pic3536616.jpg', 2015, 2, 4),

-- Alex Roux
('44444444-4444-4444-4444-444444444444', '167791', 'Terraforming Mars', 'https://cf.geekdo-images.com/thumb/img/9aMzUIbDjkDaxI4B9B3bS7iGdSk=/fit-in/200x150/pic3536616.jpg', 'https://cf.geekdo-images.com/thumb/img/9aMzUIbDjkDaxI4B9B3bS7iGdSk=/fit-in/200x150/pic3536616.jpg', 2016, 1, 5),
('44444444-4444-4444-4444-444444444444', '233078', 'Root', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 2018, 2, 4),
('44444444-4444-4444-4444-444444444444', '266524', 'Maracaibo', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 2019, 1, 4),

-- Lisa Moreau
('55555555-5555-5555-5555-555555555555', '13', 'Catan', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 1995, 3, 4),
('55555555-5555-5555-5555-555555555555', '266192', 'Wingspan', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 2019, 1, 5),

-- Thomas Leroy
('66666666-6666-6666-6666-666666666666', '182028', 'Through the Ages: A New Story of Civilization', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 2015, 2, 4),
('66666666-6666-6666-6666-666666666666', '224517', 'Brass: Birmingham', 'https://cf.geekdo-images.com/thumb/img/9aMzUIbDjkDaxI4B9B3bS7iGdSk=/fit-in/200x150/pic3536616.jpg', 'https://cf.geekdo-images.com/thumb/img/9aMzUIbDjkDaxI4B9B3bS7iGdSk=/fit-in/200x150/pic3536616.jpg', 2018, 2, 4),
('66666666-6666-6666-6666-666666666666', '169786', 'Scythe', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 2016, 1, 7),

-- Julie Petit
('77777777-7777-7777-7777-777777777777', '13', 'Catan', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 1995, 3, 4),
('77777777-7777-7777-7777-777777777777', '266192', 'Wingspan', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 2019, 1, 5),
('77777777-7777-7777-7777-777777777777', '161936', 'Pandemic Legacy: Season 1', 'https://cf.geekdo-images.com/thumb/img/9aMzUIbDjkDaxI4B9B3bS7iGdSk=/fit-in/200x150/pic3536616.jpg', 'https://cf.geekdo-images.com/thumb/img/9aMzUIbDjkDaxI4B9B3bS7iGdSk=/fit-in/200x150/pic3536616.jpg', 2015, 2, 4),

-- Marc Dubois
('88888888-8888-8888-8888-888888888888', '13', 'Catan', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 1995, 3, 4),
('88888888-8888-8888-8888-888888888888', '199478', 'Great Western Trail', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 2016, 2, 4),

-- Le Dés Bar
('99999999-9999-9999-9999-999999999999', '13', 'Catan', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 1995, 3, 4),
('99999999-9999-9999-9999-999999999999', '266192', 'Wingspan', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 2019, 1, 5),
('99999999-9999-9999-9999-999999999999', '167791', 'Terraforming Mars', 'https://cf.geekdo-images.com/thumb/img/9aMzUIbDjkDaxI4B9B3bS7iGdSk=/fit-in/200x150/pic3536616.jpg', 'https://cf.geekdo-images.com/thumb/img/9aMzUIbDjkDaxI4B9B3bS7iGdSk=/fit-in/200x150/pic3536616.jpg', 2016, 1, 5),
('99999999-9999-9999-9999-999999999999', '174430', 'Gloomhaven', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 2017, 1, 4),
('99999999-9999-9999-9999-999999999999', '182028', 'Through the Ages: A New Story of Civilization', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 2015, 2, 4),

-- Café Ludique du Sud
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '13', 'Catan', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 1995, 3, 4),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '266192', 'Wingspan', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 2019, 1, 5),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '167791', 'Terraforming Mars', 'https://cf.geekdo-images.com/thumb/img/9aMzUIbDjkDaxI4B9B3bS7iGdSk=/fit-in/200x150/pic3536616.jpg', 'https://cf.geekdo-images.com/thumb/img/9aMzUIbDjkDaxI4B9B3bS7iGdSk=/fit-in/200x150/pic3536616.jpg', 2016, 1, 5),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '161936', 'Pandemic Legacy: Season 1', 'https://cf.geekdo-images.com/thumb/img/9aMzUIbDjkDaxI4B9B3bS7iGdSk=/fit-in/200x150/pic3536616.jpg', 'https://cf.geekdo-images.com/thumb/img/9aMzUIbDjkDaxI4B9B3bS7iGdSk=/fit-in/200x150/pic3536616.jpg', 2015, 2, 4),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '199478', 'Great Western Trail', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 'https://cf.geekdo-images.com/thumb/img/1YvBj3IF_3swdS-9HHOYcXnFxt8=/fit-in/200x150/pic4458123.jpg', 2016, 2, 4),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '169786', 'Scythe', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 'https://cf.geekdo-images.com/thumb/img/0S0lVKEp8T43aFDyr7Di7bGf4d0=/fit-in/200x150/pic2419375.jpg', 2016, 1, 7)

ON CONFLICT (user_id, game_id) DO NOTHING;

-- Commentaire
COMMENT ON TABLE public.user_games IS 'Jeux d''exemple ajoutés aux collections des utilisateurs';
