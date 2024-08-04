import React from 'react';
import Head from 'next/head';
import Ahorcado from '@/components/Ahorcado/Ahorcado';
import ScoresTable from '@/components/ScoreTable/ScoreTable';
import styles from './page.module.scss';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>El Ahorcado</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={styles.main}>
        <div className={styles.gameSection}>
          <Ahorcado />
        </div>
        <div className={styles.scoresSection}>
          <ScoresTable />
        </div>
      </main>
    </div>
  );
}