'use client'

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/createClient';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import styles from './ScoreTable.module.scss';

interface ScoresTableData {
    id: number;
    player_name: string;
    score: number;
}

const ScoresTable = () => {
    const [scores, setScores] = useState<ScoresTableData[]>([]);

    useEffect(() => {
        fetchScores();

        const subscription = supabase
            .channel('players_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'players' },
                handleRealtimeUpdate
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchScores = async () => {
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .order('score', { ascending: false });

        if (error) {
            console.error('Error fetching scores:', error);
            return;
        }

        setScores(data);
    };

    const handleRealtimeUpdate = (payload: any) => {
        console.log('Change received!', payload);
        fetchScores(); // Refetch all scores when any change occurs
    };

    return (
        <div className={styles.tableContainer}>
            <Table className={styles.table}>
                <TableHeader className={styles.tableHeader}>
                    <TableRow>
                        <TableHead className={styles.tableHeaderCell}>Name</TableHead>
                        <TableHead className={styles.tableHeaderCell}>Score</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {scores.map((score) => (
                        <TableRow key={score.id}>
                            <TableCell className={styles.tableCell}>{score.player_name}</TableCell>
                            <TableCell className={styles.tableCell}>{score.score}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default ScoresTable;