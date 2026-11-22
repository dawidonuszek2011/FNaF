# Invite Night Shift — prototyp FNaF na GitHub Pages

To jest startowy prototyp gry przeglądarkowej. Nie wymaga instalowania bibliotek ani serwera — działa jako statyczna strona.

## Pliki

- `index.html` — ekrany gry i mapa lokalu.
- `style.css` — wygląd, biuro, kamery i pixelowy interfejs.
- `game.js` — logika nocy, energii, monitora i przełączania kamer.

## Uruchomienie lokalnie

Otwórz `index.html` w przeglądarce.

## Publikacja przez GitHub Pages

1. Utwórz nowe repozytorium na GitHubie.
2. Wgraj do głównego katalogu repozytorium wszystkie trzy pliki: `index.html`, `style.css`, `game.js`.
3. Wejdź w **Settings → Pages**.
4. W sekcji publikowania wybierz **Deploy from a branch**, następnie branch `main` i folder `/ (root)`.
5. Zapisz. GitHub Pages udostępni grę pod adresem repozytorium.

## Co już działa

- ekran tytułowy i rozpoczęcie nocy,
- biuro ochroniarza,
- monitor z kamerami,
- wybieranie pomieszczeń przyciskami lub bezpośrednio na mapie,
- zegar od 12 AM do 6 AM,
- zużycie energii przez monitor i światła,
- ekran końca nocy.

## Do dalszej rozbudowy

Układ pomieszczeń jest odwzorowaniem pierwszego opisu mapy. Trasy animatroników, dokładne położenie drzwi i wentylacji oraz zawartość pokoi można doprecyzować w kolejnej wersji. Identyfikatory pokoi w `game.js` są przygotowane do wykorzystania przez przyszłe AI.
