import { ThemeConfig, theme } from 'antd';

export const appTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    // 2.1 Backgrounds
    colorBgLayout: '#1e1e2f',
    colorBgContainer: '#27293d',
    colorBgElevated: '#27293d', // Dropdowns, Modals

    // 2.2 Brand
    colorPrimary: '#fd5d93',
    colorInfo: '#1d8cf8',
    colorSuccess: '#00f2c3',
    colorWarning: '#ff8d72',
    colorError: '#fd5d93',

    // 2.3 Text
    colorText: '#ffffff',
    colorTextSecondary: '#9a9a9a',
    colorTextPlaceholder: 'rgba(255, 255, 255, 0.3)',

    // 4. Dimensions
    borderRadius: 4,
    fontFamily: '"Poppins", "Roboto", "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      primaryShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
      fontWeight: 500,
    },
    Card: {
      boxShadow: '0 1px 20px 0px rgba(0, 0, 0, 0.1)',
      paddingLG: 20, // --lc-padding-card
    },
    Layout: {
      bodyBg: '#1e1e2f',
      headerBg: '#1e1e2f',
      siderBg: '#1e1e2f',
    }
  }
};
