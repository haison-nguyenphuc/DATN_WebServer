import express from 'express';
import bodyParser from "body-parser";
import { engine } from 'express-handlebars';
import { route } from './routes/route.mjs';
import session from 'express-session';
import { SerialController } from './resources/controller/SerialController.mjs';
import { database } from './database/init.mjs';

const app = express();
const port = 1205;
const serialController = new SerialController();

database.init();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(express.static('src/public'))

app.use(session({
  secret: 'mysecretkey', // Mã bí mật dùng để mã hóa session
  resave: false, // Làm mới session sau mỗi yêu cầu
  saveUninitialized: true, // Lưu trạng thái session cho các phiên làm việc chưa được khởi tạo
}));

app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', './src/resources/views');

route(app, serialController);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})

