# -*- coding: utf-8 -*-
"""
B+ Agaci (B+ Tree) -- Layihe № 8

B-Agacindan ferqi:
    1) Butun deyerler yalniz yarpaqlarda saxlanilir.
    2) Yarpaqlar bir-birine zincirle baglidir (sag qonsu).
       Bu, araliq sorgusunu (range query) cox suretli edir.
    3) Daxili node-lar yalniz "yol gosterici" acarlar saxlayir,
       hec bir deyer ozu orada yoxdur.

Node strukturu (btree_simple.py-deki kimi list esaslidir):
    node = [acarlar, ovladlar, yarpaqdir_mi, sag_qonsu]

    node[0] -> acarlar      (yarpaqda bunlar hem de "deyerler"dir)
    node[1] -> ovladlar     (daxili node-da alt node-lar; yarpaqda bos)
    node[2] -> yarpaqdir_mi (True/False)
    node[3] -> sag_qonsu    (yalniz yarpaqlarda istifade olunur; yoxdursa None)
"""

ACARLAR = 0
OVLADLAR = 1
YARPAQ = 2
SAG_QONSU = 3


def yeni_node(yarpaqdir):
    return [[], [], yarpaqdir, None]


def yeni_agac():
    t = 2
    kok = yeni_node(True)
    return [kok, t]


# Axtaris
def axtar(agac, acar):
    """Acar B+ agacinda varmi? -- axtaris HEMISE yarpaqda bitir."""
    node = agac[0]
    while not node[YARPAQ]:
        i = 0
        while i < len(node[ACARLAR]) and acar >= node[ACARLAR][i]:
            i += 1
        node = node[OVLADLAR][i]

    # Indi yarpaqdayiq -- acari bu yarpaqda axtaririq
    i = 0
    while i < len(node[ACARLAR]):
        if node[ACARLAR][i] == acar:
            return True
        i += 1
    return False


def araliq_sorgu(agac, bas, son):
    """
    bas <= x <= son araliginda olan butun acarlari qaytarir.
    Bu, B+ Agacinin EN GUCLU teref -- yarpaqlar zincirli oldugu ucun
    bir defe ilk yarpaq tapildiqdan sonra sag qonsu ile suretli gediriq.
    """
    netice = []
    node = agac[0]

    # Kokden ene-ene bas deyerin oldugu yarpaqa qeder gediriq
    while not node[YARPAQ]:
        i = 0
        while i < len(node[ACARLAR]) and bas >= node[ACARLAR][i]:
            i += 1
        node = node[OVLADLAR][i]

    # Indi yarpaqdayiq -- zincirle saga gede-gede araliqdaki acarlari yigiriq
    while node is not None:
        i = 0
        while i < len(node[ACARLAR]):
            deyer = node[ACARLAR][i]
            if deyer > son:
                return netice
            if deyer >= bas:
                netice.append(deyer)
            i += 1
        node = node[SAG_QONSU]

    return netice


# Elave etme
def elave_et(agac, acar):
    kok = agac[0]
    t = agac[1]

    if len(kok[ACARLAR]) == 2 * t - 1:
        yeni_kok = yeni_node(False)
        yeni_kok[OVLADLAR].append(kok)
        node_bol(yeni_kok, 0, t)
        agac[0] = yeni_kok
        dolu_olmayana_elave_et(yeni_kok, acar, t)
    else:
        dolu_olmayana_elave_et(kok, acar, t)


def dolu_olmayana_elave_et(node, acar, t):
    while True:
        if node[YARPAQ]:
            node[ACARLAR].append(0)
            i = len(node[ACARLAR]) - 2
            while i >= 0 and acar < node[ACARLAR][i]:
                node[ACARLAR][i + 1] = node[ACARLAR][i]
                i -= 1
            node[ACARLAR][i + 1] = acar
            return
        else:
            i = len(node[ACARLAR]) - 1
            while i >= 0 and acar < node[ACARLAR][i]:
                i -= 1
            i += 1

            if len(node[OVLADLAR][i][ACARLAR]) == 2 * t - 1:
                node_bol(node, i, t)
                if acar >= node[ACARLAR][i]:
                    i += 1

            node = node[OVLADLAR][i]


def node_bol(valideyn, i, t):
    """
    B+ Agacinda bolme B-Agacindan bir az ferqlidir:
    Yarpaq bolunende, ORTA ACAR YUXARI QALXIR, AMMA HEM DE
    sag yarpaqda QALIR (cunki yarpaqlarda butun deyerler olmalidir).
    """
    dolu = valideyn[OVLADLAR][i]
    teze = yeni_node(dolu[YARPAQ])

    if dolu[YARPAQ]:
        # YARPAQ bolunmesi
        j = t
        while j < len(dolu[ACARLAR]):
            teze[ACARLAR].append(dolu[ACARLAR][j])
            j += 1

        orta_acar = teze[ACARLAR][0]   # sag yarpaqin ilk acari yuxari qalxir

        yeni_sol = []
        j = 0
        while j < t:
            yeni_sol.append(dolu[ACARLAR][j])
            j += 1
        dolu[ACARLAR] = yeni_sol

        # Yarpaq zincirini yenileyirik: dolu -> teze -> (kohne sag qonsu)
        teze[SAG_QONSU] = dolu[SAG_QONSU]
        dolu[SAG_QONSU] = teze
    else:
        # DAXILI node bolunmesi (B-Agaci ile eynidir)
        j = t
        while j < len(dolu[ACARLAR]):
            teze[ACARLAR].append(dolu[ACARLAR][j])
            j += 1

        orta_acar = dolu[ACARLAR][t - 1]

        yeni_sol = []
        j = 0
        while j < t - 1:
            yeni_sol.append(dolu[ACARLAR][j])
            j += 1
        dolu[ACARLAR] = yeni_sol

        j = t
        while j < len(dolu[OVLADLAR]):
            teze[OVLADLAR].append(dolu[OVLADLAR][j])
            j += 1
        yeni_ovladlar = []
        j = 0
        while j < t:
            yeni_ovladlar.append(dolu[OVLADLAR][j])
            j += 1
        dolu[OVLADLAR] = yeni_ovladlar

    valideyn[OVLADLAR].insert(i + 1, teze)
    valideyn[ACARLAR].insert(i, orta_acar)


# Komekci funksiyalar
def butun_acarlar(agac):
    """Butun acarlari kicikden boyuye qaytarir (yarpaq zincirini gezerek)."""
    netice = []
    node = agac[0]
    while not node[YARPAQ]:
        node = node[OVLADLAR][0]

    while node is not None:
        i = 0
        while i < len(node[ACARLAR]):
            netice.append(node[ACARLAR][i])
            i += 1
        node = node[SAG_QONSU]
    return netice


def hundurluk(agac):
    h = 1
    node = agac[0]
    while not node[YARPAQ]:
        h += 1
        node = node[OVLADLAR][0]
    return h


def agaci_yazdir(node, derinlik):
    bosluq = ""
    i = 0
    while i < derinlik:
        bosluq += "    "
        i += 1

    if node[YARPAQ]:
        tip = "yarpaq"
    else:
        tip = "daxili"

    print(bosluq + "[" + tip + "] " + str(node[ACARLAR]))

    if not node[YARPAQ]:
        i = 0
        while i < len(node[OVLADLAR]):
            agaci_yazdir(node[OVLADLAR][i], derinlik + 1)
            i += 1


# Test
if __name__ == "__main__":
    agac = yeni_agac()
    acarlar = [10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 40, 15]

    print("Elave edilen acarlar:", acarlar)
    i = 0
    while i < len(acarlar):
        elave_et(agac, acarlar[i])
        i += 1

    print("\nAgacin gorunusu:")
    agaci_yazdir(agac[0], 0)

    print("\nSirali acarlar (yarpaq zinciri ile):", butun_acarlar(agac))
    print("Hundurluk:", hundurluk(agac))
    print("10-25 araliginda olanlar:", araliq_sorgu(agac, 10, 25))
    print("17 var?", axtar(agac, 17))
    print("99 var?", axtar(agac, 99))
