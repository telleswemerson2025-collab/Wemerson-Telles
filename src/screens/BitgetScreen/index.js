import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getSpotAssets,
  getSpotOrders,
  getFuturesPositions,
  getFuturesOrders,
  getFuturesPnL,
} from '../../services/bitgetService';

const STORAGE_KEY = '@bitget_credentials';
const TABS = ['Carteira', 'Trades', 'Posições', 'PnL'];

function fmt(value, decimals = 2) {
  const n = parseFloat(value);
  if (isNaN(n)) return '–';
  return n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtDate(ts) {
  if (!ts) return '–';
  return new Date(Number(ts)).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function pnlColor(value) {
  const n = parseFloat(value);
  if (isNaN(n) || n === 0) return '#9CA3AF';
  return n > 0 ? '#10B981' : '#EF4444';
}

function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function EmptyState({ message }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

function WalletTab({ assets }) {
  if (!assets?.length) return <EmptyState message="Nenhum ativo encontrado." />;
  const total = assets.reduce((sum, a) => sum + parseFloat(a.usdtBalance || 0), 0);
  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Saldo Total (USDT)</Text>
        <Text style={styles.totalValue}>$ {fmt(total)}</Text>
      </View>
      <SectionTitle title="Ativos" />
      {assets.map((a) => (
        <View key={a.coin} style={styles.assetRow}>
          <View>
            <Text style={styles.coinName}>{a.coin}</Text>
            <Text style={styles.coinSub}>Disponível: {fmt(a.available, 6)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.coinValue}>$ {fmt(a.usdtBalance)}</Text>
            <Text style={styles.coinSub}>Total: {fmt(a.balance, 6)}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function TradesTab({ spotOrders, futuresOrders }) {
  const all = [
    ...(spotOrders || []).map((o) => ({ ...o, _type: 'Spot' })),
    ...(futuresOrders || []).map((o) => ({ ...o, _type: 'Futuros' })),
  ].sort((a, b) => (b.cTime || b.createTime || 0) - (a.cTime || a.createTime || 0));
  if (!all.length) return <EmptyState message="Nenhuma ordem encontrada." />;
  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {all.map((o, i) => {
        const isBuy = (o.side || '').toLowerCase().includes('buy');
        return (
          <View key={`${o.orderId || i}`} style={styles.tradeCard}>
            <View style={styles.tradeHeader}>
              <Text style={styles.tradeSymbol}>{o.symbol}</Text>
              <View style={[styles.sideBadge, isBuy ? styles.buyBadge : styles.sellBadge]}>
                <Text style={styles.sideText}>{isBuy ? 'COMPRA' : 'VENDA'}</Text>
              </View>
            </View>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Preço</Text>
              <Text style={styles.tradeValue}>$ {fmt(o.priceAvg || o.price)}</Text>
            </View>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Qtd</Text>
              <Text style={styles.tradeValue}>{fmt(o.baseVolume || o.size, 4)}</Text>
            </View>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Total</Text>
              <Text style={styles.tradeValue}>$ {fmt(o.quoteVolume || o.notionalUsd)}</Text>
            </View>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Tipo</Text>
              <Text style={styles.typeText}>{o._type}</Text>
            </View>
            <Text style={styles.tradeDate}>{fmtDate(o.cTime || o.createTime)}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

function PositionsTab({ positions }) {
  if (!positions?.length) return <EmptyState message="Nenhuma posição aberta." />;
  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {positions.map((p, i) => {
        const unrealized = parseFloat(p.unrealizedPL || 0);
        return (
          <View key={`${p.symbol}-${i}`} style={styles.positionCard}>
            <View style={styles.tradeHeader}>
              <Text style={styles.tradeSymbol}>{p.symbol}</Text>
              <View style={[styles.sideBadge, p.holdSide === 'long' ? styles.buyBadge : styles.sellBadge]}>
                <Text style={styles.sideText}>{p.holdSide?.toUpperCase() || '–'}</Text>
              </View>
            </View>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Tamanho</Text>
              <Text style={styles.tradeValue}>{fmt(p.total, 4)}</Text>
            </View>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Preço Entrada</Text>
              <Text style={styles.tradeValue}>$ {fmt(p.openPriceAvg)}</Text>
            </View>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Preço Atual</Text>
              <Text style={styles.tradeValue}>$ {fmt(p.marketPrice)}</Text>
            </View>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Margem</Text>
              <Text style={styles.tradeValue}>$ {fmt(p.margin)}</Text>
            </View>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Leverage</Text>
              <Text style={styles.tradeValue}>{p.leverage}x</Text>
            </View>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>PnL não realizado</Text>
              <Text style={[styles.pnlText, { color: pnlColor(unrealized) }]}>
                {unrealized >= 0 ? '+' : ''}$ {fmt(unrealized)}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

function PnLTab({ pnlHistory }) {
  if (!pnlHistory?.length) return <EmptyState message="Sem histórico de PnL." />;
  const totalPnL = pnlHistory.reduce((sum, p) => sum + parseFloat(p.pnl || 0), 0);
  const totalFees = pnlHistory.reduce((sum, p) => sum + parseFloat(p.settledFee || 0), 0);
  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.pnlSummaryRow}>
        <View style={[styles.pnlSummaryCard, { borderColor: pnlColor(totalPnL) }]}>
          <Text style={styles.totalLabel}>PnL Total</Text>
          <Text style={[styles.totalValue, { color: pnlColor(totalPnL) }]}>
            {totalPnL >= 0 ? '+' : ''}$ {fmt(totalPnL)}
          </Text>
        </View>
        <View style={[styles.pnlSummaryCard, { borderColor: '#EF4444' }]}>
          <Text style={styles.totalLabel}>Taxas Pagas</Text>
          <Text style={[styles.totalValue, { color: '#EF4444', fontSize: 18 }]}>
            -$ {fmt(totalFees)}
          </Text>
        </View>
      </View>
      <SectionTitle title="Histórico de posições fechadas" />
      {pnlHistory.map((p, i) => {
        const pnl = parseFloat(p.pnl || 0);
        return (
          <View key={`${p.symbol}-${i}`} style={styles.tradeCard}>
            <View style={styles.tradeHeader}>
              <Text style={styles.tradeSymbol}>{p.symbol}</Text>
              <Text style={[styles.pnlText, { color: pnlColor(pnl), fontWeight: '700' }]}>
                {pnl >= 0 ? '+' : ''}$ {fmt(pnl)}
              </Text>
            </View>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Entrada</Text>
              <Text style={styles.tradeValue}>$ {fmt(p.openPriceAvg)}</Text>
            </View>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Saída</Text>
              <Text style={styles.tradeValue}>$ {fmt(p.closePriceAvg)}</Text>
            </View>
            <View style={styles.tradeRow}>
              <Text style={styles.tradeLabel}>Taxa</Text>
              <Text style={[styles.tradeValue, { color: '#EF4444' }]}>-$ {fmt(p.settledFee)}</Text>
            </View>
            <Text style={styles.tradeDate}>{fmtDate(p.closeTime)}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

function SettingsScreen({ onSave }) {
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  async function handleSave() {
    if (!apiKey.trim() || !secretKey.trim() || !passphrase.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ apiKey, secretKey, passphrase }));
    onSave({ apiKey, secretKey, passphrase });
  }

  return (
    <KeyboardAvoidingView
      style={styles.settingsContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.settingsScroll}>
        <Text style={styles.settingsTitle}>Configurar Bitget API</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Para obter suas chaves:{' '}
            Bitget → Perfil → Gerenciamento de API → Criar API{'\n'}
            Permissões necessárias: Leitura de conta e trading.
          </Text>
        </View>
        <Text style={styles.inputLabel}>API Key</Text>
        <TextInput
          style={styles.input}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="Sua API Key"
          placeholderTextColor="#6B7280"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.inputLabel}>Secret Key</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={secretKey}
            onChangeText={setSecretKey}
            placeholder="Sua Secret Key"
            placeholderTextColor="#6B7280"
            secureTextEntry={!showSecret}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.showBtn} onPress={() => setShowSecret((v) => !v)}>
            <Text style={styles.showBtnText}>{showSecret ? 'Ocultar' : 'Mostrar'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.inputLabel}>Passphrase</Text>
        <TextInput
          style={styles.input}
          value={passphrase}
          onChangeText={setPassphrase}
          placeholder="Sua Passphrase"
          placeholderTextColor="#6B7280"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Salvar e Conectar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function BitgetScreen() {
  const [credentials, setCredentials] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [assets, setAssets] = useState([]);
  const [spotOrders, setSpotOrders] = useState([]);
  const [futuresOrders, setFuturesOrders] = useState([]);
  const [positions, setPositions] = useState([]);
  const [pnlHistory, setPnlHistory] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setCredentials(JSON.parse(raw));
    });
  }, []);

  const fetchData = useCallback(async (creds) => {
    setError(null);
    try {
      const [assetsRes, spotOrdersRes, futuresOrdersRes, positionsRes, pnlRes] =
        await Promise.allSettled([
          getSpotAssets(creds),
          getSpotOrders(creds),
          getFuturesOrders(creds),
          getFuturesPositions(creds),
          getFuturesPnL(creds),
        ]);
      if (assetsRes.status === 'fulfilled' && assetsRes.value?.data)
        setAssets(assetsRes.value.data.filter((a) => parseFloat(a.balance) > 0));
      if (spotOrdersRes.status === 'fulfilled' && spotOrdersRes.value?.data)
        setSpotOrders(spotOrdersRes.value.data?.orders || spotOrdersRes.value.data || []);
      if (futuresOrdersRes.status === 'fulfilled' && futuresOrdersRes.value?.data)
        setFuturesOrders(futuresOrdersRes.value.data?.orders || futuresOrdersRes.value.data || []);
      if (positionsRes.status === 'fulfilled' && positionsRes.value?.data)
        setPositions(positionsRes.value.data || []);
      if (pnlRes.status === 'fulfilled' && pnlRes.value?.data)
        setPnlHistory(pnlRes.value.data?.list || pnlRes.value.data || []);
    } catch (e) {
      setError('Erro ao conectar. Verifique suas credenciais.');
    }
  }, []);

  useEffect(() => {
    if (!credentials) return;
    setLoading(true);
    fetchData(credentials).finally(() => setLoading(false));
  }, [credentials, fetchData]);

  async function onRefresh() {
    if (!credentials) return;
    setRefreshing(true);
    await fetchData(credentials);
    setRefreshing(false);
  }

  function handleCredentialsSaved(creds) {
    setCredentials(creds);
    setShowSettings(false);
  }

  if (showSettings || !credentials) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bitget Connect</Text>
          {credentials && (
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Text style={styles.headerAction}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
        <SettingsScreen onSave={handleCredentialsSaved} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Bitget</Text>
          <Text style={styles.headerSub}>Carteira conectada</Text>
        </View>
        <TouchableOpacity style={styles.settingsIconBtn} onPress={() => setShowSettings(true)}>
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tabBar}>
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, activeTab === i && styles.tabBtnActive]}
            onPress={() => setActiveTab(i)}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchData(credentials)}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {activeTab === 0 && (
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}>
              <WalletTab assets={assets} />
            </ScrollView>
          )}
          {activeTab === 1 && (
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}>
              <TradesTab spotOrders={spotOrders} futuresOrders={futuresOrders} />
            </ScrollView>
          )}
          {activeTab === 2 && (
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}>
              <PositionsTab positions={positions} />
            </ScrollView>
          )}
          {activeTab === 3 && (
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}>
              <PnLTab pnlHistory={pnlHistory} />
            </ScrollView>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const C = {
  bg: '#0F172A', card: '#1E293B', border: '#334155',
  text: '#F1F5F9', sub: '#94A3B8', gold: '#F59E0B',
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle: { color: C.gold, fontSize: 20, fontWeight: '700' },
  headerSub: { color: C.sub, fontSize: 12, marginTop: 2 },
  headerAction: { color: C.gold, fontSize: 14 },
  settingsIconBtn: { padding: 8 },
  settingsIcon: { fontSize: 20, color: C.sub },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: C.gold },
  tabText: { color: C.sub, fontSize: 12, fontWeight: '500' },
  tabTextActive: { color: C.gold, fontWeight: '700' },
  tabContent: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { color: C.sub, marginTop: 12, fontSize: 14 },
  errorText: { color: '#EF4444', textAlign: 'center', fontSize: 14, marginBottom: 16 },
  retryBtn: { backgroundColor: C.gold, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#000', fontWeight: '700' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { color: C.sub, fontSize: 14 },
  sectionTitle: { color: C.sub, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  totalCard: { backgroundColor: C.card, borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: C.border },
  totalLabel: { color: C.sub, fontSize: 13, marginBottom: 4 },
  totalValue: { color: C.text, fontSize: 28, fontWeight: '700' },
  assetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.card, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  coinName: { color: C.text, fontSize: 15, fontWeight: '600' },
  coinValue: { color: C.text, fontSize: 15, fontWeight: '600' },
  coinSub: { color: C.sub, fontSize: 12, marginTop: 2 },
  tradeCard: { backgroundColor: C.card, borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  tradeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tradeSymbol: { color: C.text, fontSize: 15, fontWeight: '700' },
  sideBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  buyBadge: { backgroundColor: 'rgba(16,185,129,0.2)' },
  sellBadge: { backgroundColor: 'rgba(239,68,68,0.2)' },
  sideText: { fontSize: 11, fontWeight: '700', color: C.text },
  tradeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  tradeLabel: { color: C.sub, fontSize: 12 },
  tradeValue: { color: C.text, fontSize: 12, fontWeight: '500' },
  typeText: { color: C.gold, fontSize: 12, fontWeight: '500' },
  tradeDate: { color: C.sub, fontSize: 11, marginTop: 6, textAlign: 'right' },
  positionCard: { backgroundColor: C.card, borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  pnlSummaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  pnlSummaryCard: { flex: 1, backgroundColor: C.card, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1.5 },
  pnlText: { fontSize: 13, fontWeight: '600' },
  settingsContainer: { flex: 1 },
  settingsScroll: { padding: 20, paddingBottom: 40 },
  settingsTitle: { color: C.text, fontSize: 20, fontWeight: '700', marginBottom: 20 },
  infoBox: { backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: C.gold, marginBottom: 24 },
  infoText: { color: C.gold, fontSize: 13, lineHeight: 20 },
  inputLabel: { color: C.sub, fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, color: C.text, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  showBtn: { backgroundColor: C.card, borderRadius: 8, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 12 },
  showBtnText: { color: C.gold, fontSize: 12 },
  saveBtn: { backgroundColor: C.gold, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
});
