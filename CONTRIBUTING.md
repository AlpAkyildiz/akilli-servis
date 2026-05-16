# Katkıda Bulunma Kılavuzu (Contributing)

Öncelikle bu projeye katkıda bulunmayı düşündüğünüz için teşekkür ederiz! Lütfen çalışmalara başlamadan önce aşağıdaki adımları okuyun.

## Geliştirme Akışı (Workflow)

1. Bu projeyi fork'layın.
2. Yeni bir feature (özellik) veya bugfix (hata düzeltme) dalı (branch) oluşturun:
   `git checkout -b feature/yeni-ozellik` veya `git checkout -b bugfix/hata-duzeltmesi`
3. Değişikliklerinizi yapın ve test edin.
4. Anlamlı commit mesajları yazın.
5. Dalınızı (branch) kendi fork'unuza push'layın:
   `git push origin feature/yeni-ozellik`
6. Orijinal depoya bir **Pull Request (PR)** açın.

## Kod Standartları
- Backend'de TypeScript tiplerini kesinlikle kullanın. `any` tipini kullanmaktan kaçının.
- Frontend'de komponentleri modüler tutun.
- Prettier ve ESLint kurallarına uygun kod yazın.

## Commit Kuralları
Commit mesajlarınız açıklayıcı olmalıdır (Conventional Commits standardı):
- `feat: yeni özellik eklendi`
- `fix: harita kayma sorunu çözüldü`
- `docs: api dökümantasyonu güncellendi`
