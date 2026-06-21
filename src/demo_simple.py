# -*- coding: utf-8 -*-
"""
Terminal demo -- B-Agaci ve B+ Agaci

Ise salmaq ucun:  python3 demo_simple.py
"""

import btree_simple as bt
import bplustree_simple as bpt


def xett():
    print("=" * 55)


# ---------------------------------------------------------------
# 1) B-AGACI DEMOSU
# ---------------------------------------------------------------
xett()
print("  B-AGACI DEMOSU")
xett()

agac1 = bt.yeni_agac()
agac1[1] = 2   # deyrece t=2 -> her node-da maksimum 3 acar

acarlar = [10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 40, 15]
print("\nElave edilen acarlar:", acarlar)

i = 0
while i < len(acarlar):
    bt.elave_et(agac1, acarlar[i])
    i += 1

print("\nAgacin gorunusu:")
bt.agaci_yazdir(agac1[0], 0)

print("\nSirali acarlar:", bt.butun_acarlar(agac1))
print("Hundurluk:", bt.hundurluk(agac1))
print("Node sayi:", bt.node_sayi(agac1))

print("\n17 axtar ->", "tapildi" if bt.axtar(agac1[0], 17) else "yoxdur")
print("99 axtar ->", "tapildi" if bt.axtar(agac1[0], 99) else "yoxdur")

bt.sil(agac1, 6)
bt.sil(agac1, 20)
print("\n6 ve 20 silindikden sonra:", bt.butun_acarlar(agac1))


# ---------------------------------------------------------------
# 2) B+ AGACI DEMOSU
# ---------------------------------------------------------------
print()
xett()
print("  B+ AGACI DEMOSU")
xett()

agac2 = bpt.yeni_agac()
agac2[1] = 2

print("\nElave edilen acarlar:", acarlar)
i = 0
while i < len(acarlar):
    bpt.elave_et(agac2, acarlar[i])
    i += 1

print("\nAgacin gorunusu:")
bpt.agaci_yazdir(agac2[0], 0)

print("\nSirali acarlar (yarpaq zinciri ile):", bpt.butun_acarlar(agac2))
print("Hundurluk:", bpt.hundurluk(agac2))

print("\n10-25 araliginda olan acarlar (range query):")
print(bpt.araliq_sorgu(agac2, 10, 25))

print("\n17 axtar ->", "tapildi" if bpt.axtar(agac2, 17) else "yoxdur")

print()
xett()
print("  DEMO BITDI")
xett()
