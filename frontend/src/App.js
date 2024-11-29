import './App.css';
import LandingPage from './components/landingPage/LandingPage.js';
import {Routes, Route} from 'react-router-dom';
import NewsFeed from './components/mainContent/NewsFeed.js';
import UserFeed from './components/mainContent/UserFeed.js';
import PostDetails from './components/mainContent/PostDetails.js';
import FoodRecommend from './components/market/FoodRecommend.js';
import StoreDashboard from './components/storeManagement/StoreDashboard.js';
import StoreDetail from './components/market/StoreDetail.js';
import Cart from './components/market/Cart.js';
import Checkout from './components/market/Checkout.js';
import Order from './components/market/Order.js';
import OrderDetail from './components/market/orders/OrderDetail.js';
import Reviews from './components/market/Reviews.js';
import Notification from './components/mainContent/Notification.js';
import ChangePassword from './components/profile/ChangePassword.js';
import Explore from './components/explore/Explore.js';
import Messenger from './components/messenger/Messenger.js';
import Admin from './components/admin/Admin.js'

function App() {
  return (
    <Routes>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='/home' element={<NewsFeed/>}/>
      <Route path='/market' element={<FoodRecommend/>}/>
      <Route path='/store' element={<StoreDashboard/>}/>
      <Route path='/cart' element={<Cart/>}/>
      <Route path='/checkout' element={<Checkout/>}/>
      <Route path='/myorder' element={<Order/>}/>
      <Route path='/notifications' element={<Notification/>}/>
      <Route path='/setting' element={<ChangePassword/>}/>
      <Route path='/explore' element={<Explore/>}/>
      <Route path='/messages' element={<Messenger/>}/>
      <Route path='/adminrequest' element={<Admin/>}/>
      <Route path='/:username' element={<UserFeed/>}/> 
      <Route path='/:username/post/:id' element={<PostDetails/>}/>
      <Route path='/restaurant/:id' element={<StoreDetail/>}/>
      <Route path='/restaurant/:id/reviews' element={<Reviews/>}/>
      <Route path='/order/:id' element={<OrderDetail/>}/>
    </Routes>

  );
}

export default App;
