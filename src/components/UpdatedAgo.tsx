import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

type Props = {
  // Момент последней успешной загрузки данных.
  since: Date;
};

function secondsSince(since: Date): number {
  return Math.max(0, Math.floor((Date.now() - since.getTime()) / 1000));
}

// Подпись «Обновлено N сек назад».
export function UpdatedAgo({ since }: Props) {
  const sinceMs = since.getTime();
  const [seconds, setSeconds] = useState(() => secondsSince(since));

  useEffect(() => {
    const at = new Date(sinceMs);
    setSeconds(secondsSince(at));

    const id = setInterval(() => {
      setSeconds(secondsSince(at));
    }, 1000);

    return () => clearInterval(id);
  }, [sinceMs]);

  return <Text style={styles.text}>Обновлено {seconds} сек назад</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    color: '#6b7280',
  },
});
