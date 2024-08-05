'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Ahorcado.module.scss';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from '../ui/button';
import { supabase } from '@/lib/createClient';

export const Ahorcado = () => {
  const [word, setWord] = useState('');
  const [normalizedWord, setNormalizedWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState(new Set<string>());
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [showVictoryDialog, setShowVictoryDialog] = useState(false);
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const maxAttempts = 6;

  useEffect(() => {
    initGame();
  }, []);

  const initGame = async () => {
    try {
      const fetchedWord = await getWord();
      setWord(fetchedWord.toUpperCase());
      setNormalizedWord(normalizeString(fetchedWord).toUpperCase());
      setGuessedLetters(new Set());
      setAttempts(0);
      setMessage('');
      setGameOver(false);
      setShowVictoryDialog(false);
      setScore(0);
      setPlayerName('');
    } catch (error) {
      console.error('Error al iniciar el juego:', error);
      setMessage('Error al iniciar el juego. Por favor, recarga la página.');
    }
  };

  const getWord = async () => {
    const response = await fetch('https://random-word-api.herokuapp.com/word?lang=es');
    if (!response.ok) {
      throw new Error('No se pudo obtener una palabra aleatoria.');
    }
    const data = await response.json();
    return data[0];
  };

  const normalizeString = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const makeGuess = (letter: string) => {
    if (gameOver) {
      return;
    }

    if (guessedLetters.has(letter)) {
      setMessage('Ya has intentado esa letra.');
      return;
    }

    const newGuessedLetters = new Set(guessedLetters);
    newGuessedLetters.add(letter);
    setGuessedLetters(newGuessedLetters);

    if (normalizedWord.includes(normalizeString(letter))) {
      if (!getWordDisplay(newGuessedLetters).includes('_')) {
        const newScore = calculateScore(attempts);
        setScore(newScore);
        setMessage('¡Felicidades! Has ganado.');
        setGameOver(true);
        setShowVictoryDialog(true);
      } else {
        setMessage('¡Bien hecho! Letra correcta.');
      }
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= maxAttempts) {
        setMessage(`Has perdido. La palabra era: ${word}`);
        setGameOver(true);
      } else {
        setMessage('Letra incorrecta. Intenta de nuevo.');
      }
    }
  };

  const getWordDisplay = (guessed: Set<string>) => {
    return word
      .split('')
      .map(letter => guessed.has(normalizeString(letter)) ? letter : '_')
      .join(' ');
  };

  const calculateScore = (incorrectAttempts: number) => {
    const baseScore = 100;
    const penaltyPerIncorrect = 10;
    const finalScore = Math.max(0, baseScore - (incorrectAttempts * penaltyPerIncorrect));

    if(incorrectAttempts == maxAttempts) {
      return 0;
    }
    
    return finalScore;
  };

  const handleSaveScore = async () => {
    if (playerName.trim()) {
      try {
        const { data, error } = await supabase
          .from('players')
          .insert([{ player_name: playerName, score: score }]);

        if (error) {
          throw error;
        }

        console.log('Puntuación guardada:', data);
        setShowVictoryDialog(false);
        initGame();
      } catch (error) {
        console.error('Error al guardar la puntuación:', error);
        setMessage('Error al guardar la puntuación. Intenta nuevamente.');
      }
    }
  };

  const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
  const midpoint = Math.ceil(alphabet.length / 2);

  return (
    <>
    <div className={styles.gameContainer}>
        <h1 className={styles.title}>El Ahorcado</h1>
        <div className={styles.gameContent}>
          <Image src={`/hangman-${attempts}.png`} alt={`Ahorcado - ${attempts} intentos`} width={200} height={200} className={styles.hangmanImage} />
          <div className={styles.gameInfo}>
            <div className={styles.wordDisplay}>{getWordDisplay(guessedLetters)}</div>
            <div className={styles.guesses}>Letras intentadas: {Array.from(guessedLetters).join(', ')}</div>
            <div className={styles.message}>{message}</div>
          </div>
        </div>
        <div className={styles.letterButtons}>
          {alphabet.split('').map(letter => (
            <button key={letter} onClick={() => makeGuess(letter)} disabled={guessedLetters.has(letter) || gameOver}>
              {letter}
            </button>
          ))}
        </div>
        {gameOver && !showVictoryDialog && (
          <Button className={styles.newGameButton} onClick={initGame}>
            Jugar de nuevo
          </Button>
        )}
      </div>
      
      <AlertDialog open={showVictoryDialog} onOpenChange={setShowVictoryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¡Felicidades! Has ganado</AlertDialogTitle>
            <AlertDialogDescription>
              Tu puntuación es: {score}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            type="text"
            placeholder="Ingresa tu nombre"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            />
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSaveScore}>Guardar puntuación</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
    </>
  );
};

export default Ahorcado;