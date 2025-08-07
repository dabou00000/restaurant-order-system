# تعليمات النشر السريع

## الخيار الأول: GitHub Pages (الأسهل والأسرع)

### الخطوات:
1. **اذهب إلى [GitHub.com](https://github.com)**
2. **أنشئ حساب جديد أو سجل دخول**
3. **اضغط على زر "+" ثم "New repository"**
4. **أدخل اسم المستودع:** `order-system`
5. **اختر "Public"**
6. **اضغط "Create repository"**

### رفع الملفات:
1. **اسحب جميع الملفات من مجلد المشروع إلى GitHub**
2. **أو استخدم Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/[username]/order-system.git
   git push -u origin main
   ```

### تفعيل GitHub Pages:
1. **اذهب إلى Settings > Pages**
2. **اختر Source: Deploy from a branch**
3. **اختر Branch: main**
4. **اضغط Save**

### الرابط النهائي:
```
https://[username].github.io/order-system
```

---

## الخيار الثاني: Netlify (مجاني وسريع)

### الخطوات:
1. **اذهب إلى [Netlify.com](https://netlify.com)**
2. **اضغط "Sign up" أو سجل دخول**
3. **اسحب مجلد المشروع إلى Netlify**
4. **احصل على رابط فوري**

### أو ارفع من GitHub:
1. **اضغط "New site from Git"**
2. **اختر GitHub**
3. **اختر المستودع**
4. **اضغط "Deploy site"**

---

## الخيار الثالث: Vercel (مجاني وسريع)

### الخطوات:
1. **اذهب إلى [Vercel.com](https://vercel.com)**
2. **اضغط "Sign up" أو سجل دخول**
3. **اضغط "New Project"**
4. **اتصل بحساب GitHub**
5. **اختر المستودع**
6. **اضغط "Deploy"**

---

## ملاحظات مهمة:

### بعد النشر:
- ✅ النظام سيعمل على الإنترنت
- ✅ يمكن الوصول إليه من أي جهاز
- ✅ QR codes ستعمل مع الرابط الجديد
- ✅ لا حاجة لجدار الحماية

### تحديث QR Codes:
- بعد النشر، يجب إعادة إنشاء QR codes للطاولات
- اذهب إلى "إدارة الطاولات" في النظام
- اضغط "تحديث QR" لكل طاولة

### الروابط النهائية:
- **الإدارة:** `https://[domain]/`
- **المطبخ:** `https://[domain]/kitchen.html`
- **طلبات العملاء:** `https://[domain]/order.html?table=[رقم]`

---

## الأفضلية:
1. **GitHub Pages** - الأسهل والأسرع
2. **Netlify** - ممتاز للاستخدام المباشر
3. **Vercel** - ممتاز للاستخدام المباشر

جميع الخيارات مجانية وممتازة! 🚀 