# Como integrar a tela Bitget no App Gui Telles

## 1. Instalar dependências

```bash
npm install crypto-js @react-native-async-storage/async-storage
# iOS
cd ios && pod install
```

## 2. Adicionar a rota/tela no seu navegador

### Se usa React Navigation:

```js
import BitgetScreen from './src/screens/BitgetScreen';

<Stack.Screen
  name="Bitget"
  component={BitgetScreen}
  options={{ headerShown: false }}
/>
```

### Para abrir via link/botão dentro do app:

```js
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();

<TouchableOpacity onPress={() => navigation.navigate('Bitget')}>
  <Text>Abrir Carteira Bitget</Text>
</TouchableOpacity>
```

## 3. Gerar as chaves na Bitget

1. Acesse **bitget.com** → faça login
2. Vá em **Perfil** → **Gerenciamento de API**
3. Clique em **Criar nova API**
4. Configure:
   - Nome: Gui Telles App
   - Permissões: ✅ Leitura ✅ Trade
   - IP Whitelist: opcional
5. Anote: **API Key**, **Secret Key** e **Passphrase**

## 4. Estrutura dos arquivos

```
src/
  screens/
    BitgetScreen/
      index.js          ← tela principal (Carteira, Trades, Posições, PnL)
  services/
    bitgetService.js    ← chamadas autenticadas à API Bitget v2
```
