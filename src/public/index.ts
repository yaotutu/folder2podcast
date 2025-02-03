import fs from 'fs-extra';
import path from 'path';

const publicDir = path.join(__dirname);  // 保持在 src/public 目录下

// 确保目录存在
fs.ensureDirSync(publicDir);

// 复制静态资源文件
fs.copyFileSync(
    path.join(__dirname, 'index.html'),
    path.join(publicDir, 'index.html')
);

fs.copyFileSync(
    path.join(__dirname, 'styles.css'),
    path.join(publicDir, 'styles.css')
);

fs.copyFileSync(
    path.join(__dirname, 'app.js'),
    path.join(publicDir, 'app.js')
); 