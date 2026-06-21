# -*- coding: utf-8 -*-
"""
B-Agaci (B-Tree) -- Layihe № 8

Bu modulda axtaris, elave etme ve silme emeliyyatlari yazilib.
Her node-u bir siyahi (list) kimi saxlayiram, cunki bele yazanda
hansi addimda ne ile isledigimi daha rahat izleye bilirem:

    node = [acarlar, ovladlar, yarpaqdir_mi]

    node[0] -> acarlar       : ededed siyahisi,   meselen [10, 20, 30]
    node[1] -> ovladlar      : alt node-larin siyahisi (yarpaqda bos [])
    node[2] -> yarpaqdir_mi  : True / False

Kodu oxumagi asanlasdirmaq ucun bu 3 indeksi sabit kimi yazdim:
"""

ACARLAR = 0      # node[ACARLAR]      -> acarlarin siyahisi
OVLADLAR = 1     # node[OVLADLAR]     -> ovlad node-larin siyahisi
YARPAQ = 2       # node[YARPAQ]       -> True/False (yarpaqdirmi?)


def yeni_node(yarpaqdir):
    """Bos bir node (qovsaq) yaradir."""
    acarlar = []
    ovladlar = []
    return [acarlar, ovladlar, yarpaqdir]


def yeni_agac():
    """
    Bos bir B-Agaci yaradir.
    Agaci ozu de bir siyahi kimi saxlayiriq:
        agac = [kok_node, t]
    kok_node -> agacin koku (en yuxari node)
    t        -> deyrece (minimum derece) -- her node-da neçe acar olacaq
    """
    t = 2  # default deyrece (her node-da maksimum 2*t-1 = 3 acar)
    kok = yeni_node(True)
    return [kok, t]


# Axtaris
def axtar(node, acar):
    """
    Verilen 'acar' bu node-da (ve onun alt agaclarinda) varmi?
    Var -> True,  Yox -> False
    
    """
    while True:
        i = 0
        # Node daxilindeki acarlari soldan saga gezirik
        while i < len(node[ACARLAR]) and acar > node[ACARLAR][i]:
            i += 1

        # Tam bu yerde tapildimi?
        if i < len(node[ACARLAR]) and node[ACARLAR][i] == acar:
            return True

        # Yarpaqdirsa ve tapilmayibsa -- demek acar agacda yoxdur
        if node[YARPAQ]:
            return False

        # Yarpaq deyilse, uygun ovlada keciriq (dovr davam edir)
        node = node[OVLADLAR][i]


# Elave etme (insert)
def elave_et(agac, acar):
    """Agaca yeni acar elave edir."""
    kok = agac[0]
    t = agac[1]

    # Eger kok artiq doludursa (2t-1 acar varsa), onu bolmek lazimdir
    if len(kok[ACARLAR]) == 2 * t - 1:
        yeni_kok = yeni_node(False)
        yeni_kok[OVLADLAR].append(kok)
        node_bol(yeni_kok, 0, t)
        agac[0] = yeni_kok       # agacin koku deyisdi
        dolu_olmayana_elave_et(yeni_kok, acar, t)
    else:
        dolu_olmayana_elave_et(kok, acar, t)


def dolu_olmayana_elave_et(node, acar, t):
    """
    Node-a yeni acar elave edir. Bu node DOLU DEYIL (2t-1-den az acari var).
    """
    while True:
        if node[YARPAQ]:
            # Yarpaqdirsa -- acari duzgun (sirali) yerine qoyuruq
            node[ACARLAR].append(0)          # yer aciriq
            i = len(node[ACARLAR]) - 2
            while i >= 0 and acar < node[ACARLAR][i]:
                node[ACARLAR][i + 1] = node[ACARLAR][i]
                i -= 1
            node[ACARLAR][i + 1] = acar
            return
        else:
            # Hansi ovlada gedeceyini tapiriq
            i = len(node[ACARLAR]) - 1
            while i >= 0 and acar < node[ACARLAR][i]:
                i -= 1
            i += 1

            # O ovlad doludursa, evvelce onu boluruk
            if len(node[OVLADLAR][i][ACARLAR]) == 2 * t - 1:
                node_bol(node, i, t)
                if acar > node[ACARLAR][i]:
                    i += 1

            node = node[OVLADLAR][i]
            # novbeti ovlada kecirik


def node_bol(valideyn, i, t):
    """
    valideyn-in i-ci dolu ovladini IKI yere bolur.
        - Ortadaki acar yuxari (valideyne) qalxir.
        - Sol yari kohne node-da qalir.
        - Sag yari TEZE bir node-a kecir.
    """
    dolu = valideyn[OVLADLAR][i]
    teze = yeni_node(dolu[YARPAQ])

    # Sag yarinin acarlari teze node-a kecir
    j = t
    while j < len(dolu[ACARLAR]):
        teze[ACARLAR].append(dolu[ACARLAR][j])
        j += 1

    # Ortadaki acar
    orta_acar = dolu[ACARLAR][t - 1]

    # Sol yari -- kohne node-da sadece ilk (t-1) acar qalir
    yeni_sol = []
    j = 0
    while j < t - 1:
        yeni_sol.append(dolu[ACARLAR][j])
        j += 1
    dolu[ACARLAR] = yeni_sol

    # Yarpaq deyilse, ovladlari da bolmek lazimdir
    if not dolu[YARPAQ]:
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

    # Valideyne -- teze node-u ve orta acari elave edirik
    valideyn[OVLADLAR].insert(i + 1, teze)
    valideyn[ACARLAR].insert(i, orta_acar)


# Silme (delete)
def sil(agac, acar):
    """Acari agacdan silir."""
    t = agac[1]
    node_sil(agac[0], acar, t)

    # Eger kok bosaldıbsa ve yarpaq deyilse, ovladi teze kok olur
    kok = agac[0]
    if len(kok[ACARLAR]) == 0 and not kok[YARPAQ]:
        agac[0] = kok[OVLADLAR][0]


def node_sil(node, acar, t):
    """Silmenin esas hissesi."""
    while True:
        i = 0
        while i < len(node[ACARLAR]) and acar > node[ACARLAR][i]:
            i += 1

        # Acar bu node-dadir?
        if i < len(node[ACARLAR]) and node[ACARLAR][i] == acar:
            if node[YARPAQ]:
                node[ACARLAR].pop(i)
                return
            else:
                daxili_sil(node, i, t)
                return
        else:
            # Acar bu node-da yoxdur
            if node[YARPAQ]:
                return  # agacda belə acar yoxdur

            # Enecegimiz ovladda kifayet qeder acar olduguna emin oluruq
            if len(node[OVLADLAR][i][ACARLAR]) < t:
                doldur(node, i, t)
                if i > len(node[ACARLAR]):
                    i -= 1

            node = node[OVLADLAR][i]
            # novbeti ovlada kecirik


def daxili_sil(node, i, t):
    """Daxili (yarpaq olmayan) node-dan acari silir."""
    acar = node[ACARLAR][i]

    if len(node[OVLADLAR][i][ACARLAR]) >= t:
        # Sol alt-agacdan en boyuk acari goturub evez edirik
        sel = en_boyuk(node[OVLADLAR][i])
        node[ACARLAR][i] = sel
        node_sil(node[OVLADLAR][i], sel, t)
    elif len(node[OVLADLAR][i + 1][ACARLAR]) >= t:
        # Sag alt-agacdan en kicik acari goturub evez edirik
        sel = en_kicik(node[OVLADLAR][i + 1])
        node[ACARLAR][i] = sel
        node_sil(node[OVLADLAR][i + 1], sel, t)
    else:
        # Her ikisi kicikdir -- birlesdiririk
        birlesdir(node, i)
        node_sil(node[OVLADLAR][i], acar, t)


def en_boyuk(node):
    """Alt-agacdaki en boyuk acari tapir."""
    while not node[YARPAQ]:
        node = node[OVLADLAR][-1]
    return node[ACARLAR][-1]


def en_kicik(node):
    """Alt-agacdaki en kicik acari tapir."""
    while not node[YARPAQ]:
        node = node[OVLADLAR][0]
    return node[ACARLAR][0]


def doldur(node, i, t):
    """i-ci ovladda acar azdirsa, qonsudan borc alir ve ya birlesdirir."""
    if i > 0 and len(node[OVLADLAR][i - 1][ACARLAR]) >= t:
        borc_sol(node, i)
    elif i < len(node[OVLADLAR]) - 1 and len(node[OVLADLAR][i + 1][ACARLAR]) >= t:
        borc_sag(node, i)
    elif i < len(node[OVLADLAR]) - 1:
        birlesdir(node, i)
    else:
        birlesdir(node, i - 1)


def borc_sol(node, i):
    """Sol qonsudan bir acar borc alir."""
    ovlad = node[OVLADLAR][i]
    sol = node[OVLADLAR][i - 1]
    ovlad[ACARLAR].insert(0, node[ACARLAR][i - 1])
    node[ACARLAR][i - 1] = sol[ACARLAR].pop()
    if not sol[YARPAQ]:
        ovlad[OVLADLAR].insert(0, sol[OVLADLAR].pop())


def borc_sag(node, i):
    """Sag qonsudan bir acar borc alir."""
    ovlad = node[OVLADLAR][i]
    sag = node[OVLADLAR][i + 1]
    ovlad[ACARLAR].append(node[ACARLAR][i])
    node[ACARLAR][i] = sag[ACARLAR].pop(0)
    if not sag[YARPAQ]:
        ovlad[OVLADLAR].append(sag[OVLADLAR].pop(0))


def birlesdir(node, i):
    """i-ci ve (i+1)-ci ovladlari birlesdirir."""
    sol = node[OVLADLAR][i]
    sag = node[OVLADLAR][i + 1]

    sol[ACARLAR].append(node[ACARLAR][i])

    j = 0
    while j < len(sag[ACARLAR]):
        sol[ACARLAR].append(sag[ACARLAR][j])
        j += 1

    if not sol[YARPAQ]:
        j = 0
        while j < len(sag[OVLADLAR]):
            sol[OVLADLAR].append(sag[OVLADLAR][j])
            j += 1

    node[ACARLAR].pop(i)
    node[OVLADLAR].pop(i + 1)


# Komekci funksiyalar
def butun_acarlar(agac):
    """Butun acarlari KICIKDEN BOYUYE sirali siyahi kimi qaytarir."""
    netice = []
    gez_ve_yigh(agac[0], netice)
    return netice


def gez_ve_yigh(node, netice):
    """Agaci 'in-order' gezir ve acarlari netice siyahisina yigir."""
    i = 0
    while i < len(node[ACARLAR]):
        if not node[YARPAQ]:
            gez_ve_yigh(node[OVLADLAR][i], netice)
        netice.append(node[ACARLAR][i])
        i += 1
    if not node[YARPAQ]:
        gez_ve_yigh(node[OVLADLAR][-1], netice)


def hundurluk(agac):
    """Agacin hundurluyunu (seviyye sayini) qaytarir."""
    h = 1
    node = agac[0]
    while not node[YARPAQ]:
        h += 1
        node = node[OVLADLAR][0]
    return h


def node_sayi(agac):
    """Agacdaki butun node-larin sayini sayir."""
    sayac = 0
    nobet = [agac[0]]          # gozleme siyahisi (queue kimi istifade edirik)
    while len(nobet) > 0:
        cari = nobet.pop(0)
        sayac += 1
        i = 0
        while i < len(cari[OVLADLAR]):
            nobet.append(cari[OVLADLAR][i])
            i += 1
    return sayac


def agaci_yazdir(node, derinlik):
    """Agaci terminalda gorsel sekilde (girintili) yazdirir."""
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


# Bu fayl birbasa isledilende -- kicik test
if __name__ == "__main__":
    agac = yeni_agac()

    acarlar = [10, 20, 5, 6, 12, 30, 7, 17]
    print("Elave edilen acarlar:", acarlar)

    i = 0
    while i < len(acarlar):
        elave_et(agac, acarlar[i])
        i += 1

    print("\nAgacin gorunusu:")
    agaci_yazdir(agac[0], 0)

    print("\nSirali acarlar:", butun_acarlar(agac))
    print("Hundurluk:", hundurluk(agac))
    print("Node sayi:", node_sayi(agac))
    print("17 var?", axtar(agac[0], 17))
    print("99 var?", axtar(agac[0], 99))

    sil(agac, 6)
    print("\n6 silindikden sonra:", butun_acarlar(agac))
