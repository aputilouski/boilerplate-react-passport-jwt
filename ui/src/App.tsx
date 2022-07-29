import { Route, Switch } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';
import { SignIn, MainPage } from 'pages';
import { Layout, AuthController } from 'components';
import { Provider } from 'react-redux';
import { store, history } from 'redux-manager';

const App = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route exact path="/" component={SignIn} />
        {/* <Route path="/register" component={Register} /> */}
        <Route>
          <AuthController>
            <Layout>
              <Switch>
                <Route path="/main" component={MainPage} />
              </Switch>
            </Layout>
          </AuthController>
        </Route>
      </Switch>
    </ConnectedRouter>
  </Provider>
);

export default App;
