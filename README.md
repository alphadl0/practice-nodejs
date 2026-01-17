# Sunuticket - Etkinlik Bilet Satış Sistemi

## Proje Açıklaması
Kullanıcılar etkinlikleri listeleyebilir, yeni etkinlik oluşturabilir, bilet satın alabilir ve belirli kurallar çerçevesinde biletlerini iptal edebilirler.

## Senaryo Tanımları (İş Kuralları)

Proje kapsamında iki temel iş kuralı (Business Rule) uygulanmıştır:

1.  **Stok Kontrolü (Satın Alma):**
    - Bir kullanıcı bilet almak istediğinde, sistem etkinliğin kapasitesini ve satılan bilet sayısını kontrol eder.
    - Eğer `satılan bilet sayısı >= kapasite` ise, sistem hata döner ve bilet satışına izin vermez.

2.  **Tarih Kontrolü (İptal):**
    - Bir kullanıcı biletini iptal etmek istediğinde, sistem etkinlik tarihini kontrol eder.
    - Etkinliğe **6 saatten az** bir süre kalmışsa, iptal işlemine izin verilmez.


## API Endpoint Listesi

GET  `/api/events` Tüm etkinlikleri listeler
POST `/api/events` Yeni bir etkinlik oluşturur
GET  `/api/users/:userId/tickets` Belirli bir kullanıcının biletlerini getirir
POST `/api/tickets` Bilet satın alma işlemi (Stok kontrolü içerir)
DELETE `/api/tickets/:id`  Bilet iptal işlemi (Tarih kontrolü içerir)
