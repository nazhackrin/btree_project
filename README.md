# B-Ağacı (B-Tree) və B+ Ağacı — Layihə № 8

**Verilənlərin Strukturu və Alqoritmlər — Final Layihəsi**

Bu layihə B-Tree və B+ Tree məlumat strukturlarını **sıfırdan**, heç bir hazır
kitabxana istifadə etmədən realizə edir. Python kodu sadəcə list, for, while
və if ilə yazılıb. Veb sayt isə bütün testləri brauzerdə canlı göstərə bilir —
Python işə salmadan.

---

## 📁 Qovluq strukturu

```
btree_project/
├── index.html               # Sayt strukturu (kök qovluqda — GitHub Pages bunu avtomatik açır)
├── styles.css                # Saytın bütün dizaynı
├── script.js                 # Saytın bütün məntiqi (ağac alqoritmləri, canlı demo, canlı benchmark)
├── assets/                   # Benchmark qrafikləri (index.html bunlardan istifadə edir)
│   └── qraf_*.png
│
├── src/                      # Python kodu
│   ├── btree_simple.py       # B-Tree: axtarış, əlavə, silmə
│   ├── bplustree_simple.py   # B+ Tree: bağlı yarpaqlar, range query
│   └── demo_simple.py        # Terminal demosu
│
├── benchmark/
│   └── benchmark_simple.py   # Performans testləri, qrafiklər yaradır
│
├── docs/
│   ├── B-Agaci_Hesabat_AZ.pdf          # Tam hesabat
│   ├── B-Agaci_Istifade_Manuali_AZ.pdf # İstifadəçi/müdafiə manualı
│   └── qraf_*.png                      # Qrafiklərin əsl nüsxəsi (yedək)
│
└── README.md
```

## 🌐 Saytı açmaq

### Lokal (kompüterdə)
`index.html` faylına iki dəfə klik et. İnternet lazım deyil — `styles.css`
və `script.js` yanında olduğu üçün avtomatik tapılır.

### GitHub Pages (onlayn)
1. Project `https://nazhackrin.github.io/btree_project/` ünvanında açılır.

---

## 🐍 Python kodunu işə salmaq

```bash
cd src
python3 demo_simple.py        # Terminal demosu (B-Tree + B+ Tree)
python3 btree_simple.py       # Yalnız B-Tree testi
python3 bplustree_simple.py   # Yalnız B+ Tree testi
```

VSCode-da işə salmaq istəsən, `docs/B-Agaci_Istifade_Manuali_AZ.pdf`
faylındaki addım-addım təlimata bax.

### Benchmark (qrafiklər yaradır)
```bash
pip install matplotlib --break-system-packages
cd benchmark
python3 benchmark_simple.py
```
Bu, `docs/` qovluğuna yeni qrafiklər yazır. Sayt üçün həmin faylları
`assets/` qovluğuna da kopyalamaq lazımdır:
```bash
cp docs/qraf_*.png ../assets/
```

**Qeyd:** bu addım məcburi deyil — saytın Benchmark bölməsində eyni testləri
Python-suz, birbaşa brauzerdə də apara bilərsən (aşağıya bax).

---

## 📖 Dashboard bölmələri

1. **Nəzəri Əsas** — strukturun işləmə prinsipi, vaxt/yaddaş mürəkkəbliyi
2. **Canlı Demo** — interaktiv B-Tree/B+ Tree vizuallaşdırması (əlavə et, axtar, sil, aralıq sorğusu)
3. **Müqayisəli Analiz** — bizim kod vs Python bisect, C++ std::map
4. **Benchmark** — həm hazır qrafiklər, həm də **canlı testlər**: öz rəqəmlərini yazıb "Testi apar" düyməsi ilə brauzerdə dərhal yeni qrafik yaratmaq olur, Python lazım deyil
5. **Nəticə** — mühəndislik tövsiyələri

## ✅ Müdafiə üçün tövsiyə

`docs/B-Agaci_Istifade_Manuali_AZ.pdf` faylında hər Python funksiyasının
sadə izahı, VSCode-da kodu işə salma təlimatı, saytın canlı benchmark
xüsusiyyəti və müəllimin verə biləcəyi 58 sual-cavab izah olunub.
