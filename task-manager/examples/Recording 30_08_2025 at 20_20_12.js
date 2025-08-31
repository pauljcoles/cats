const puppeteer = require('puppeteer'); // v23.0.0 or later

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    {
        const targetPage = page;
        await targetPage.setViewport({
            width: 1163,
            height: 1276
        })
    }
    {
        const targetPage = page;
        await targetPage.goto('https://www.renault.co.uk/electric-vehicles/r5-e-tech-electric.html');
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('div.ContentZone__submenu button'),
            targetPage.locator('::-p-xpath(//*[@id=\\"Page\\"]/div[2]/div/div/div[2]/div/div[2]/div[1]/button)'),
            targetPage.locator(':scope >>> div.ContentZone__submenu button')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 47.640625,
                y: 28,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#engines > div.RadioGroupButton > div:nth-of-type(2) span'),
            targetPage.locator('::-p-xpath(//*[@id=\\"engines\\"]/div[3]/div[2]/div/label/span)'),
            targetPage.locator(':scope >>> #engines > div.RadioGroupButton > div:nth-of-type(2) span'),
            targetPage.locator('::-p-text(150 hp)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 47.796875,
                y: 26.8125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#grades > div.RadioGroupButton > div:nth-of-type(2) span'),
            targetPage.locator('::-p-xpath(//*[@id=\\"grades\\"]/div[3]/div[2]/div/label/span)'),
            targetPage.locator(':scope >>> #grades > div.RadioGroupButton > div:nth-of-type(2) span'),
            targetPage.locator('::-p-text(iconic five)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 55.578125,
                y: 13.828125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('div.RadioGroupButton > div:nth-of-type(3) span'),
            targetPage.locator('::-p-xpath(//*[@id=\\"grades\\"]/div[3]/div[3]/div/label/span)'),
            targetPage.locator(':scope >>> div.RadioGroupButton > div:nth-of-type(3) span'),
            targetPage.locator('::-p-text(Roland Garros)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 98.5,
                y: 16.828125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('div.OneConfig__mainContainer li:nth-of-type(8) div'),
            targetPage.locator('::-p-xpath(//*[@id=\\"CATCOLORS1\\"]/div[2]/div[2]/ul/li[8]/span/button/div)'),
            targetPage.locator(':scope >>> div.OneConfig__mainContainer li:nth-of-type(8) div')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 25,
                y: 23.765625,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#PC01 li:nth-of-type(4) div'),
            targetPage.locator('::-p-xpath(//*[@id=\\"PC01\\"]/div[2]/div[2]/ul/li[4]/span/button/div)'),
            targetPage.locator(':scope >>> #PC01 li:nth-of-type(4) div')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 49,
                y: 38.1875,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#accessories > div:nth-of-type(2) > div > div > div > div > div:nth-of-type(1) div.Checkbox'),
            targetPage.locator('::-p-xpath(//*[@id=\\"accessories\\"]/div[2]/div/div/div/div/div[1]/button[2]/div/div[1])'),
            targetPage.locator(':scope >>> #accessories > div:nth-of-type(2) > div > div > div > div > div:nth-of-type(1) div.Checkbox')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 21,
                y: 30.453125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#accessories > div:nth-of-type(2) > div > div > div > div > div:nth-of-type(2) label'),
            targetPage.locator('::-p-xpath(//*[@id=\\"accessories\\"]/div[2]/div/div/div/div/div[2]/button[2]/div/div[1]/div/label)'),
            targetPage.locator(':scope >>> #accessories > div:nth-of-type(2) > div > div > div > div > div:nth-of-type(2) label')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 47,
                y: 15.453125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(Add a touch of originality to your interior thanks to this large storage box with this 3D printed lid. You will only have to slide your hand to access your belongings. Opt for this blue number5 pattern which features the emblematic number 5. blue numbeR5 lid for large central storage compartment £34)'),
            targetPage.locator('div:nth-of-type(11) > button.OneConfigEquipmentCard__trigger'),
            targetPage.locator('::-p-xpath(//*[@id=\\"accessories\\"]/div[2]/div/div/div/div/div[11]/button[2])'),
            targetPage.locator(':scope >>> div:nth-of-type(11) > button.OneConfigEquipmentCard__trigger')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 82,
                y: 175.453125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(EXTERIOR) >>>> ::-p-aria([role=\\"generic\\"])'),
            targetPage.locator('div:nth-of-type(3) > button > span'),
            targetPage.locator('::-p-xpath(//*[@id=\\"accessories\\"]/div[3]/button/span)'),
            targetPage.locator(':scope >>> div:nth-of-type(3) > button > span')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 128,
                y: 5.046875,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(TRANSPORT AND PROTECTION) >>>> ::-p-aria([role=\\"generic\\"])'),
            targetPage.locator('#accessories > div:nth-of-type(4) > button > span'),
            targetPage.locator('::-p-xpath(//*[@id=\\"accessories\\"]/div[4]/button/span)'),
            targetPage.locator(':scope >>> #accessories > div:nth-of-type(4) > button > span'),
            targetPage.locator('::-p-text(TRANSPORT AND)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 182,
                y: 5.046875,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(DESIGN & STYLING) >>>> ::-p-aria([role=\\"generic\\"])'),
            targetPage.locator('div:nth-of-type(5) > button > span'),
            targetPage.locator('::-p-xpath(//*[@id=\\"accessories\\"]/div[5]/button/span)'),
            targetPage.locator(':scope >>> div:nth-of-type(5) > button > span'),
            targetPage.locator('::-p-text(DESIGN & STYLING)')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 140,
                y: 0.046875,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('#accessories > div:nth-of-type(5) div.Checkbox__boxContainer'),
            targetPage.locator('::-p-xpath(//*[@id=\\"accessories\\"]/div[5]/div/div/div/div/div/button[2]/div/div[1]/div/label/div[1])'),
            targetPage.locator(':scope >>> #accessories > div:nth-of-type(5) div.Checkbox__boxContainer')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 9,
                y: 19.453125,
              },
            });
    }
    {
        const targetPage = page;
        await puppeteer.Locator.race([
            targetPage.locator('div.OneConfigReceiptCta > button'),
            targetPage.locator('::-p-xpath(//*[@id=\\"Page\\"]/div[1]/div[1]/div[2]/div[2]/div/div[8]/div[2]/button)'),
            targetPage.locator(':scope >>> div.OneConfigReceiptCta > button')
        ])
            .setTimeout(timeout)
            .click({
              offset: {
                x: 189,
                y: 22,
              },
            });
    }
    {
        const targetPage = page;
        const promises = [];
        const startWaitingForEvents = () => {
            promises.push(targetPage.waitForNavigation());
        }
        await puppeteer.Locator.race([
            targetPage.locator('::-p-aria(login to My Renault)'),
            targetPage.locator('div.Dialog button.is-cta-primary'),
            targetPage.locator('::-p-xpath(/html/body/div[5]/div/div[2]/div[2]/button[2])'),
            targetPage.locator(':scope >>> div.Dialog button.is-cta-primary')
        ])
            .setTimeout(timeout)
            .on('action', () => startWaitingForEvents())
            .click({
              offset: {
                x: 84.78125,
                y: 17.328125,
              },
            });
        await Promise.all(promises);
    }

    await browser.close();

})().catch(err => {
    console.error(err);
    process.exit(1);
});
