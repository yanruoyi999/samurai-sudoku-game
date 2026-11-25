const qaSources = ['desktop', 'mobile', 'review'] as const;
export type QaSource = typeof qaSources[number] | 'unmarked';

export function qaSource(value: string | string[] | undefined): QaSource {
  return qaSources.find(source => source === value) ?? 'unmarked';
}

export function withQa(path: string, source: QaSource) {
  return source === 'unmarked' ? path : path + '?qa=' + source;
}
