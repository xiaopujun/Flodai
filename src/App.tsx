import { ConfigProvider } from 'antd';
import { RootStore, RootStoreContext } from './stores/RootStore';
import { appTheme } from './theme';
import './styles/global.less';
import { AppRoot } from './pages/AppRoot';

const rootStore = new RootStore();

function App() {
  return (
    <ConfigProvider theme={appTheme}>
      <RootStoreContext.Provider value={rootStore}>
        <AppRoot />
      </RootStoreContext.Provider>
    </ConfigProvider>
  );
}

export default App;
