# -*- coding: utf-8 -*-
"""
Benchmark -- B-Agaci / B+ Agaci vs Python-un hazir alternativi

Bu skript:
    1) Yazdigimiz agacin suretini olcur.
    2) Python-un hazir 'bisect' modulu ile muqayise edir.
    3) Neticeleri qrafik kimi 'docs/' qovluguna yazir.

Ise salmaq:
    pip install matplotlib
    python3 benchmark_simple.py
"""

import sys
import os
import time
import random
import bisect

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))
import btree_simple as bt

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

DOCS_QOVLUGU = os.path.join(os.path.dirname(__file__), "..", "docs")


# 1) Dərəcənin (t) Hündürlüyə təsiri
def test_derece_hundurluk():
    print("Test 1: Dərəcənin hündürlüyə təsiri...")
    deyreceler = [2, 3, 4, 5, 8, 10, 16, 32]
    hunduruklery = []

    acar_sayi = 5000
    acarlar = list(range(acar_sayi))
    random.shuffle(acarlar)

    i = 0
    while i < len(deyreceler):
        t = deyreceler[i]
        agac = bt.yeni_agac()
        agac[1] = t

        j = 0
        while j < len(acarlar):
            bt.elave_et(agac, acarlar[j])
            j += 1

        hunduruklery.append(bt.hundurluk(agac))
        i += 1

    plt.figure(figsize=(7, 5))
    plt.plot(deyreceler, hunduruklery, marker="o", color="#4458d4")
    plt.xlabel("Dərəcə (t)")
    plt.ylabel("Ağacın hündürlüyü")
    plt.title("Dərəcənin hündürlüyə təsiri (5000 acar)")
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(DOCS_QOVLUGU, "qraf_derece_hundurluk.png"), dpi=130)
    plt.close()
    print("  -> qraf_derece_hundurluk.png yaradildi")


# 2) MIQYAS TESTI -- N boyudukce vaxt nece deyisir
def test_miqyas():
    print("Test 2: Miqyas testi (N boyudukce vaxt)...")
    olculer = [1000, 5000, 10000, 20000, 40000]
    btree_vaxtlari = []
    list_vaxtlari = []

    i = 0
    while i < len(olculer):
        n = olculer[i]
        acarlar = list(range(n))
        random.shuffle(acarlar)

        # Bizim B-Agaci
        agac = bt.yeni_agac()
        agac[1] = 8
        basla = time.time()
        j = 0
        while j < len(acarlar):
            bt.elave_et(agac, acarlar[j])
            j += 1
        btree_vaxtlari.append(time.time() - basla)

        # Sade sirali list + bisect (Python-un hazir alternativi)
        sirali = []
        basla = time.time()
        j = 0
        while j < len(acarlar):
            bisect.insort(sirali, acarlar[j])
            j += 1
        list_vaxtlari.append(time.time() - basla)

        i += 1

    plt.figure(figsize=(7, 5))
    plt.plot(
        olculer, btree_vaxtlari, marker="o", label="Bizim B-Agaci", color="#0e9f6e"
    )
    plt.plot(
        olculer,
        list_vaxtlari,
        marker="s",
        label="Sirali list (bisect.insort)",
        color="#e0455e",
    )
    plt.xlabel("Açar sayı (N)")
    plt.ylabel("Vaxt (sayı)")
    plt.title("Əlavə etmə vaxtı: B-Ağacı vs sıralı list")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(DOCS_QOVLUGU, "qraf_miqyas.png"), dpi=130)
    plt.close()
    print("  -> qraf_miqyas.png yaradildi")


# 3) AXTARIS SURETI MUQAYISESI
def test_axtaris():
    print("Test 3: Axtaris suretinin muqayisesi...")
    n = 20000
    acarlar = list(range(n))
    random.shuffle(acarlar)

    agac = bt.yeni_agac()
    agac[1] = 8
    i = 0
    while i < len(acarlar):
        bt.elave_et(agac, acarlar[i])
        i += 1

    sirali = sorted(acarlar)

    axtarisan_acarlar = random.sample(range(n), 2000)

    basla = time.time()
    i = 0
    while i < len(axtarisan_acarlar):
        bt.axtar(agac[0], axtarisan_acarlar[i])
        i += 1
    btree_vaxt = time.time() - basla

    basla = time.time()
    i = 0
    while i < len(axtarisan_acarlar):
        bisect.bisect_left(sirali, axtarisan_acarlar[i])
        i += 1
    bisect_vaxt = time.time() - basla

    plt.figure(figsize=(6, 5))
    plt.bar(
        ["Bizim B-Agaci", "bisect (Python kitabxanasi)"],
        [btree_vaxt, bisect_vaxt],
        color=["#0e9f6e", "#4458d4"],
    )
    plt.ylabel("Vaxt (saniye) -- 2000 axtaris")
    plt.title(f"Axtaris suretinin muqayisesi (N={n})")
    plt.tight_layout()
    plt.savefig(os.path.join(DOCS_QOVLUGU, "qraf_axtaris.png"), dpi=130)
    plt.close()
    print("  -> qraf_axtaris.png yaradildi")

    return btree_vaxt, bisect_vaxt


if __name__ == "__main__":
    if not os.path.exists(DOCS_QOVLUGU):
        os.makedirs(DOCS_QOVLUGU)

    test_derece_hundurluk()
    test_miqyas()
    bv, sv = test_axtaris()

    print("\nNeticeler docs/ qovluguna yazildi.")
    print(f"Axtaris: Bizim B-Agaci = {bv:.4f}s, bisect = {sv:.4f}s")
