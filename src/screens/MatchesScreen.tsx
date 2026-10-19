import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { UpdatedAgo } from '../components/UpdatedAgo';
import { MATCHES_URL } from '../config';
import { useFavorites } from '../hooks/useFavorites';
import type { Match, MatchFilter, MatchesResponse } from '../types/matches';
import { getVisibleMatches } from '../utils/matches';

const FILTERS: { key: MatchFilter; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'upcoming', label: 'Предстоящие' },
  { key: 'finished', label: 'Завершённые' },
];

function emptyMessage(filter: MatchFilter, query: string, totalMatches: number): string {
  if (query.trim()) {
    return 'По такому запросу матчей нет — попробуйте другое название клуба.';
  }
  if (totalMatches === 0) {
    return 'В этом туре пока ничего не запланировано.';
  }
  if (filter !== 'all') {
    return 'В этом фильтре пока пусто — попробуйте «Все».';
  }
  return 'Матчей нет.';
}

export function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [round, setRound] = useState<number | null>(null);
  const [filter, setFilter] = useState<MatchFilter>('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const { isFavorite, toggle } = useFavorites();

  const loadMatches = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    try {
      const response = await fetch(MATCHES_URL);
      if (!response.ok) {
        throw new Error(`Не удалось загрузить матчи (${response.status})`);
      }

      const data = (await response.json()) as MatchesResponse;
      const list = Array.isArray(data.matches) ? data.matches : [];
      setMatches(list);
      setRound(typeof data.round === 'number' ? data.round : null);
      setUpdatedAt(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Что-то пошло не так';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadMatches('initial');
  }, [loadMatches]);

  const visible = getVisibleMatches(matches, filter, query);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#111827" />
        <Text style={styles.hint}>Загружаем матчи…</Text>
      </View>
    );
  }

  if (error && matches.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorTitle}>Не получилось загрузить</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.button} onPress={() => void loadMatches('initial')}>
          <Text style={styles.buttonText}>Повторить</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Матчи тура{round != null ? ` ${round}` : ''}
      </Text>

      <View style={styles.toolbar}>
        {updatedAt ? <UpdatedAgo since={updatedAt} /> : <View />}
        <Pressable
          style={styles.refreshButton}
          onPress={() => void loadMatches('refresh')}
          accessibilityRole="button"
          accessibilityLabel="Обновить список матчей"
        >
          <Text style={styles.refreshText}>Обновить</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <Pressable onPress={() => void loadMatches('refresh')}>
            <Text style={styles.errorBannerAction}>Повторить</Text>
          </Pressable>
        </View>
      ) : null}

      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder="Поиск по клубу"
        placeholderTextColor="#9ca3af"
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        accessibilityLabel="Поиск матчей по названию клуба"
      />

      <View style={styles.filters}>
        {FILTERS.map((item) => {
          const active = filter === item.key;
          return (
            <Pressable
              key={item.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilter(item.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={() => toggle(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadMatches('refresh')}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Матчей нет</Text>
            <Text style={styles.emptyText}>{emptyMessage(filter, query, matches.length)}</Text>
          </View>
        }
        contentContainerStyle={visible.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    minHeight: 28,
  },
  refreshButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#991b1b',
  },
  errorBannerAction: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
  search: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  chipActive: {
    backgroundColor: '#111827',
  },
  chipText: {
    fontSize: 14,
    color: '#374151',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  hint: {
    fontSize: 14,
    color: '#6b7280',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyList: {
    flexGrow: 1,
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
