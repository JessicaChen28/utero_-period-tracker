
import type { CatImage } from '../types';

const csvData = `vibe,path_in_zip,photographer,photographer_url
happy,happy/happy_5263845.jpg,KATRIN  BOLOVTSOVA,https://www.pexels.com/@ekaterina-bolovtsova
happy,happy/happy_32063368.jpg,Travis Ireland,https://www.pexels.com/@travis-ireland-2150207206
happy,happy/happy_15065253.jpg,Alimurat Üral,https://www.pexels.com/@alimuart
happy,happy/happy_8359629.jpg,Vlada Karpovich,https://www.pexels.com/@vlada-karpovich
happy,happy/happy_5263849.jpg,KATRIN  BOLOVTSOVA,https://www.pexels.com/@ekaterina-bolovtsova
happy,happy/happy_7726107.jpg,Arina Krasnikova,https://www.pexels.com/@arina-krasnikova
happy,happy/happy_32272444.jpg,Eyyüp Erten,https://www.pexels.com/@eyyup-erten-1462748243
happy,happy/happy_30878546.jpg,Christian Alfa,https://www.pexels.com/@apictures
happy,happy/happy_10160211.jpg,Dmitry Egorov,https://www.pexels.com/@egorov
happy,happy/happy_14516239.jpg,Özge  Taşkıran,https://www.pexels.com/@ozge-taskiran-85164141
sad,sad/sad_1302290.jpg,Diana ✨,https://www.pexels.com/@didsss
sad,sad/sad_679438.jpg,NEOSiAM  2024+,https://www.pexels.com/@neosiam
sad,sad/sad_7534385.jpg,Mikhail Nilov,https://www.pexels.com/@mikhail-nilov
sad,sad/sad_2555068.jpg,Thiago  Matos,https://www.pexels.com/@thiagomobile
sad,sad/sad_17667955.jpg,Alex Ozerov-Meyer,https://www.pexels.com/@alex-ozerov-meyer-651936162
sad,sad/sad_9300055.jpg,Marina Pechnikova,https://www.pexels.com/@marina-pechnikova-93670000
sad,sad/sad_290164.jpg,Pixabay,https://www.pexels.com/@pixabay
sad,sad/sad_6337608.jpg,ShotPot,https://www.pexels.com/@shotpot
sad,sad/sad_6756095.jpg,cottonbro studio,https://www.pexels.com/@cottonbro
sad,sad/sad_1543801.jpg,Cats Coming,https://www.pexels.com/@catscoming
tired,tired/tired_1120049.jpg,Dương Nhân,https://www.pexels.com/@d-ng-nhan-324384
tired,tired/tired_6958554.jpg,Photo By: Kaboompics.com,https://www.pexels.com/@karolina-grabowska
tired,tired/tired_7725998.jpg,Arina Krasnikova,https://www.pexels.com/@arina-krasnikova
tired,tired/tired_4016610.jpg,Khoa Võ,https://www.pexels.com/@khoa-vo-2347168
tired,tired/tired_1485968.jpg,Diana ✨,https://www.pexels.com/@didsss
tired,tired/tired_982299.jpg,Alena Koval,https://www.pexels.com/@alena-koval-233944
tired,tired/tired_596591.jpg,Leah Newhouse,https://www.pexels.com/@leah-newhouse-50725
tired,tired/tired_7654495.jpg,Pavel Danilyuk,https://www.pexels.com/@pavel-danilyuk
tired,tired/tired_1754894.jpg,Halil İbrahim  ÇETİN,https://www.pexels.com/@halilibrahimctn
tired,tired/tired_16945536.jpg,Kaan  ALTUN,https://www.pexels.com/@kaan-altun-527579053
bored,bored/bored_33918518.jpg,Mustafa Çay,https://www.pexels.com/@mustafa-cay-2155828724
bored,bored/bored_34276830.jpg,Jerson Martins,https://www.pexels.com/@jerson-martins-1514473344
bored,bored/bored_2558605.jpg,Chevon Rossouw,https://www.pexels.com/@chevonrossouw
bored,bored/bored_34276829.jpg,Jerson Martins,https://www.pexels.com/@jerson-martins-1514473344
bored,bored/bored_14558546.jpg,Eugenia Remark,https://www.pexels.com/@eugenia-remark-5767088
bored,bored/bored_34244860.jpg,Zeynep  Silan,https://www.pexels.com/@zeynep-silan-727236558
bored,bored/bored_34285762.jpg,Talha Kılıç,https://www.pexels.com/@talha-kilic-517654077
bored,bored/bored_45201.jpg,Pixabay,https://www.pexels.com/@pixabay
bored,bored/bored_30913848.jpg,Jesse R,https://www.pexels.com/@jesserphotonyc
bored,bored/bored_804475.jpg,Bekka Mongeau,https://www.pexels.com/@bekka419
hungry,hungry/hungry_2870510.jpg,Tomas Ryant,https://www.pexels.com/@canaros
hungry,hungry/hungry_2188791.jpg,Tranmautritam,https://www.pexels.com/@tranmautritam
hungry,hungry/hungry_2518134.jpg,Jimme Deknatel,https://www.pexels.com/@jimme-deknatel-1244708
hungry,hungry/hungry_16881825.jpg,Jasmine Pang,https://www.pexels.com/@jasmine-pang-232852617
hungry,hungry/hungry_2928158.jpg,Kelly,https://www.pexels.com/@kelly
hungry,hungry/hungry_8521833.jpg,Brayden Stanford,https://www.pexels.com/@brayden-stanford-74121309
hungry,hungry/hungry_3796766.jpg,Aleksandrina Serafimova,https://www.pexels.com/@aleksandrina-serafimova-2158505
hungry,hungry/hungry_4064423.jpg,Marcus Aurelius,https://www.pexels.com/@marcus-aurelius
hungry,hungry/hungry_8985189.jpg,Евгения Егорова,https://www.pexels.com/@egojane
hungry,hungry/hungry_599492.jpg,Matheus Guimarães,https://www.pexels.com/@ozrenildo
playful,playful/playful_4587954.jpg,Anna Shvets,https://www.pexels.com/@shvetsa
playful,playful/playful_162319.jpg,Pixabay,https://www.pexels.com/@pixabay
playful,playful/playful_27505768.jpg,Jose  Prada,https://www.pexels.com/@jose-prada-1063299555
playful,playful/playful_7725621.jpg,Arina Krasnikova,https://www.pexels.com/@arina-krasnikova
playful,playful/playful_28314786.jpg,Hom Nay Chup Gi,https://www.pexels.com/@homnaychupgi
playful,playful/playful_10160237.jpg,Dmitry Egorov,https://www.pexels.com/@egorov
playful,playful/playful_19607025.jpg,Anete Lusina,https://www.pexels.com/@anete-lusina
playful,playful/playful_15742568.jpg,Mon & Sweet Cats,https://www.pexels.com/@mon-sweet-cats-347866906
playful,playful/playful_7516804.jpg,RDNE Stock project,https://www.pexels.com/@rdne
playful,playful/playful_6932446.jpg,Mikhail Nilov,https://www.pexels.com/@mikhail-nilov
curious,curious/curious_34283932.jpg,İdil  Çelikler,https://www.pexels.com/@idilcelikler
curious,curious/curious_34345888.jpg,大 董,https://www.pexels.com/@724211268
curious,curious/curious_973955.jpg,Monica Silvestre,https://www.pexels.com/@monica
curious,curious/curious_5216263.jpg,Yan Krukau,https://www.pexels.com/@yankrukov
curious,curious/curious_34327845.jpg,Shota Photographer,https://www.pexels.com/@shota-photographer-2156182980
curious,curious/curious_6869637.jpg,cottonbro studio,https://www.pexels.com/@cottonbro
curious,curious/curious_34262227.jpg,İro 🎈,https://www.pexels.com/@i-ro-351893550
curious,curious/curious_1653357.jpg,Peng Louis,https://www.pexels.com/@peng-louis-587527
curious,curious/curious_34324149.jpg,Hossein Hosseini,https://www.pexels.com/@hossein-hosseini-637652593
curious,curious/curious_6853304.jpg,cottonbro studio,https://www.pexels.com/@cottonbro
grumpy,grumpy/grumpy_1497855.jpg,Craig Adderley,https://www.pexels.com/@thatguycraig000
grumpy,grumpy/grumpy_11719833.jpg,Liana Tril',https://www.pexels.com/@liana-tril-86841229
grumpy,grumpy/grumpy_1311572.jpg,Myicahel Tamburini,https://www.pexels.com/@myca
grumpy,grumpy/grumpy_5909808.jpg,cottonbro studio,https://www.pexels.com/@cottonbro
grumpy,grumpy/grumpy_9719093.jpg,Claudio Herrera,https://www.pexels.com/@claudio-herrera-114405749
grumpy,grumpy/grumpy_533053.jpg,Pixabay,https://www.pexels.com/@pixabay
grumpy,grumpy/grumpy_1287365.jpg,Crina Doltu,https://www.pexels.com/@crina-doltu-490924
grumpy,grumpy/grumpy_8359649.jpg,Vlada Karpovich,https://www.pexels.com/@vlada-karpovich
grumpy,grumpy/grumpy_5332796.jpg,Omar Ramadan,https://www.pexels.com/@omar-ramadan-1739260
grumpy,grumpy/grumpy_5836041.jpg,ROMAN ODINTSOV,https://www.pexels.com/@roman-odintsov
sleepy,sleepy/sleepy_7267648.jpg,Dzenina Lukac,https://www.pexels.com/@dzeninalukac
sleepy,sleepy/sleepy_2817419.jpg,Dương Nhân,https://www.pexels.com/@d-ng-nhan-324384
sleepy,sleepy/sleepy_28052762.jpg,Carvalho Renato,https://www.pexels.com/@carvalho-renato-1747562114
sleepy,sleepy/sleepy_13772527.jpg,Magda Ehlers,https://www.pexels.com/@magda-ehlers-pexels
sleepy,sleepy/sleepy_28310483.jpg,Nika Navi,https://www.pexels.com/@nika-navi-1413177760
sleepy,sleepy/sleepy_12969005.jpg,Антон Злобин,https://www.pexels.com/@dellsad
sleepy,sleepy/sleepy_5472514.jpg,Ryutaro Tsukata,https://www.pexels.com/@ryutaro
sleepy,sleepy/sleepy_15511204.jpg,Steven Van Elk,https://www.pexels.com/@steven-van-elk-9757164
sleepy,sleepy/sleepy_10873305.jpg,analogue enjoyer,https://www.pexels.com/@sosha
sleepy,sleepy/sleepy_870827.jpg,Burak The Weekender,https://www.pexels.com/@weekendplayer
majestic,majestic/majestic_33238051.jpg,咲淚 月雨,https://www.pexels.com/@622177503
majestic,majestic/majestic_31915260.jpg,Tatiana Yel,https://www.pexels.com/@tatiana-yel-2151896660
majestic,majestic/majestic_34244417.jpg,Diana Dău,https://www.pexels.com/@diana-dau-2569920
majestic,majestic/majestic_33711231.jpg,Jovan Vasiljević,https://www.pexels.com/@jovanvasiljevic
majestic,majestic/majestic_32126021.jpg,Magda Ehlers,https://www.pexels.com/@magda-ehlers-pexels
majestic,majestic/majestic_16257530.jpg,Stephany Lorena,https://www.pexels.com/@stephany-lorena-276313736
majestic,majestic/majestic_32939773.jpg,İsa Kılavuzoğlu,https://www.pexels.com/@i-sa-kilavuzoglu-2147500545
majestic,majestic/majestic_6949506.jpg,David Atkins,https://www.pexels.com/@david-atkins-11679899
majestic,majestic/majestic_27421207.jpg,Ирина Сороколетова,https://www.pexels.com/@2557985
majestic,majestic/majestic_10998011.jpg,정규송 Nui MALAMA,https://www.pexels.com/@nui-malama-169330637
`;

// Simple CSV parser. This is naive and assumes no commas within fields.
const parseCsvData = (csv: string): CatImage[] => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    
    // Find column indices to be safe
    const vibeIndex = headers.indexOf('vibe');
    const pathIndex = headers.indexOf('path_in_zip');
    const photographerIndex = headers.indexOf('photographer');
    const urlIndex = headers.indexOf('photographer_url');

    return lines.slice(1).map(line => {
        // A simple split, assumes no commas in photographer names
        const values = line.match(/(?:[^,"]|"(?:\\.|[^"])*")+/g) || [];
        return {
            vibe: values[vibeIndex] || '',
            path: values[pathIndex] || '',
            photographer: values[photographerIndex] || 'Unknown',
            photographerUrl: values[urlIndex] || 'https://www.pexels.com'
        };
    });
};

const imageDatabase: CatImage[] = parseCsvData(csvData);

export const getCatImageForVibe = (vibe: string): CatImage | null => {
    const matchingImages = imageDatabase.filter(img => img.vibe === vibe);
    if (matchingImages.length > 0) {
        return matchingImages[Math.floor(Math.random() * matchingImages.length)];
    }
    
    // Fallback to a default 'curious' vibe if no images are found
    const fallbackImages = imageDatabase.filter(img => img.vibe === 'curious');
    if (fallbackImages.length > 0) {
        return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    }

    return null; // Should not happen if CSV is populated
};
