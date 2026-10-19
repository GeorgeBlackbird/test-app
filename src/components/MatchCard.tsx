import { StyleSheet, Text, View } from 'react-native';
import type { Match } from '../types/matches';
import { formatScore, formatStartsAt, statusLabel } from '../utils/matches';
import { FavoriteButton } from './FavoriteButton';

type Props = {
  match: Match;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export function MatchCard({ match, isFavorite, onToggleFavorite }: Props) {
  const score = formatScore(match);
  const statusText =
    match.status === 'live' && match.minute != null
      ? `${statusLabel(match.status)}, ${match.minute}'`
      : statusLabel(match.status);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.teams}>
          <Text style={styles.team}>{match.home.name}</Text>
          <Text style={styles.vs}>—</Text>
          <Text style={styles.team}>{match.away.name}</Text>
        </View>
        <FavoriteButton active={isFavorite} onPress={onToggleFavorite} />
      </View>

      {score != null ? <Text style={styles.score}>{score}</Text> : null}

      <Text style={styles.meta}>{formatStartsAt(match.startsAt)}</Text>
      <Text style={styles.status}>{statusText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  teams: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  team: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  vs: {
    fontSize: 14,
    color: '#9ca3af',
  },
  score: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  meta: {
    marginTop: 6,
    fontSize: 13,
    color: '#6b7280',
  },
  status: {
    marginTop: 2,
    fontSize: 13,
    color: '#374151',
  },
});
