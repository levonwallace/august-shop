/* August — real catalog sample pulled from august-shop.com (Shopify products.json).
   Images hotlink Shopify's CDN — fine for the prototype; at port time this
   whole file disappears and Liquid iterates real collections instead. */
window.AugustCatalog = (() => {
  const PRODUCTS = [
  {
    "title": "Nike Men's ACG \"Second Sunrise\" Dri-FIT ADV 5\u2026",
    "brand": "Nike",
    "dept": "men",
    "cat": "apparel",
    "sale": false,
    "price": 85.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_f903cbd1-5b67-4112-8e8d-4d62117640fa.jpg?width=600"
  },
  {
    "title": "Adidas Men's Adistar XLG 2.0",
    "brand": "Adidas",
    "dept": "men",
    "cat": "shoes",
    "sale": false,
    "price": 150.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_1e333fd5-4743-4416-bb06-26cb4838f324.jpg?width=600"
  },
  {
    "title": "Adidas Men's Adistar XLG 2.0",
    "brand": "Adidas",
    "dept": "men",
    "cat": "shoes",
    "sale": false,
    "price": 150.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_46be356c-dede-493f-9980-0ae86a2b77ac.jpg?width=600"
  },
  {
    "title": "Adidas Men's Adistar XLG 2.0",
    "brand": "Adidas",
    "dept": "men",
    "cat": "shoes",
    "sale": false,
    "price": 150.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_296a750e-e309-4734-a777-a8ba4da69720.jpg?width=600"
  },
  {
    "title": "Adidas Men's Adistar XLG 2.0",
    "brand": "Adidas",
    "dept": "men",
    "cat": "shoes",
    "sale": false,
    "price": 150.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_1e879c04-2be1-459e-a6f9-d1d61f349445.jpg?width=600"
  },
  {
    "title": "Adidas Men's Adistar XLG 2.0",
    "brand": "Adidas",
    "dept": "men",
    "cat": "shoes",
    "sale": false,
    "price": 150.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_b2b8ab41-bf87-4f27-bcdc-7c17e587be26.jpg?width=600"
  },
  {
    "title": "Adidas Men's Adistar Control 5",
    "brand": "Adidas",
    "dept": "men",
    "cat": "shoes",
    "sale": false,
    "price": 100.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_f34c7189-2b70-454e-9fd8-1ceaf1873186.jpg?width=600"
  },
  {
    "title": "Saucony Men's Progrid Guide 7",
    "brand": "Saucony",
    "dept": "men",
    "cat": "shoes",
    "sale": true,
    "price": 94.0,
    "compare": 135.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/39_1390b492-8a82-4684-85f7-6979ac4bfc5e.jpg?width=600"
  },
  {
    "title": "Nike Men's Zoom Hyperflight \"DMV\"",
    "brand": "Nike",
    "dept": "men",
    "cat": "shoes",
    "sale": true,
    "price": 119.0,
    "compare": 170.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/25_f102437e-cc44-4d60-bef5-4d8505e3e161.jpg?width=600"
  },
  {
    "title": "Nike Men's Air Max 95 Tech",
    "brand": "Nike",
    "dept": "men",
    "cat": "shoes",
    "sale": true,
    "price": 139.0,
    "compare": 200.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_a839bcfe-c078-4c14-828a-b20d1b13074e.jpg?width=600"
  },
  {
    "title": "Nike Men's Air Foamposite Pro \"Voltage\"",
    "brand": "Nike",
    "dept": "men",
    "cat": "shoes",
    "sale": true,
    "price": 164.0,
    "compare": 240.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_50ccb45e-ffa0-4050-aa13-ae13dbbcec48.jpg?width=600"
  },
  {
    "title": "Birkenstock Men's Arizona Leather Woven - Reg\u2026",
    "brand": "Birkenstock",
    "dept": "men",
    "cat": "shoes",
    "sale": true,
    "price": 119.0,
    "compare": 170.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/3_032864bd-181d-490f-a85d-92a61087eef2.jpg?width=600"
  },
  {
    "title": "Nike Men's Kobe Air Force 1 Low \"Daybreak\"",
    "brand": "Nike",
    "dept": "men",
    "cat": "shoes",
    "sale": true,
    "price": 84.0,
    "compare": 120.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_793ba973-0993-4b2f-93c3-bea61876500a.jpg?width=600"
  },
  {
    "title": "Carhartt WIP Vegas Cardholder",
    "brand": "Carhartt WIP",
    "dept": "unisex",
    "cat": "accessories",
    "sale": false,
    "price": 65.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_52ca17ca-d2e1-42cd-92be-ad7e951e20b7.jpg?width=600"
  },
  {
    "title": "New Era x Seinfeld Baltimore Orioles 9TWENTY",
    "brand": "New Era",
    "dept": "unisex",
    "cat": "accessories",
    "sale": false,
    "price": 46.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_c60e60b1-74b3-48d5-ba60-824fc107799f.jpg?width=600"
  },
  {
    "title": "New Era x Seinfeld New York Mets 9TWENTY",
    "brand": "New Era",
    "dept": "unisex",
    "cat": "accessories",
    "sale": false,
    "price": 46.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_47fd0798-bd0a-4cdc-8fbd-a642a6309c13.jpg?width=600"
  },
  {
    "title": "New Era x Seinfeld New York Yankees 9TWENTY",
    "brand": "New Era",
    "dept": "unisex",
    "cat": "accessories",
    "sale": false,
    "price": 46.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_e2a73498-2ce3-4a57-9825-1b574a20b51c.jpg?width=600"
  },
  {
    "title": "Carne Bollente Hoofin It Socks",
    "brand": "Carne Bollente",
    "dept": "unisex",
    "cat": "accessories",
    "sale": false,
    "price": 25.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_62706270-9684-4fbf-8c79-13ee7b835343.jpg?width=600"
  },
  {
    "title": "Online Ceramics Online Mountains Hat",
    "brand": "Online Ceramics",
    "dept": "unisex",
    "cat": "accessories",
    "sale": false,
    "price": 45.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_ba0617ad-fe8a-4022-b472-ec20b3cf2f17.jpg?width=600"
  },
  {
    "title": "Dude. Your Team Socks. Checkered Socks",
    "brand": "Dude. Your Team Socks.",
    "dept": "unisex",
    "cat": "accessories",
    "sale": true,
    "price": 15.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/GreenWhite.jpg?width=600"
  },
  {
    "title": "Carhartt WIP Anglistic Sweater",
    "brand": "Carhartt WIP",
    "dept": "unisex",
    "cat": "apparel",
    "sale": false,
    "price": 165.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_1bfcaac1-70f7-45e1-b198-308bb9c2655b.jpg?width=600"
  },
  {
    "title": "Carhartt WIP Bagley Shirt",
    "brand": "Carhartt WIP",
    "dept": "unisex",
    "cat": "apparel",
    "sale": false,
    "price": 165.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_b04d0c2d-9020-42f4-99a2-2579a1f043a1.jpg?width=600"
  },
  {
    "title": "Carhartt WIP Vista T-Shirt",
    "brand": "Carhartt WIP",
    "dept": "unisex",
    "cat": "apparel",
    "sale": false,
    "price": 68.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_ab991a73-ae88-440b-8471-ba92c6813a16.jpg?width=600"
  },
  {
    "title": "Carhartt WIP Vista T-Shirt",
    "brand": "Carhartt WIP",
    "dept": "unisex",
    "cat": "apparel",
    "sale": false,
    "price": 68.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_c0bf0ee6-f1fb-40ec-8bb1-2b8fc026750c.jpg?width=600"
  },
  {
    "title": "Carhartt WIP Lambert T-Shirt",
    "brand": "Carhartt WIP",
    "dept": "unisex",
    "cat": "apparel",
    "sale": false,
    "price": 65.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_792b1a7a-34cb-4cc6-96e4-95abcfcf6496.jpg?width=600"
  },
  {
    "title": "Carhartt WIP Chez WIP T-Shirt",
    "brand": "Carhartt WIP",
    "dept": "unisex",
    "cat": "apparel",
    "sale": false,
    "price": 58.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_a42921da-5fac-43de-a173-68014f4d3ea9.jpg?width=600"
  },
  {
    "title": "Online Ceramics God is Alive and Well Tee",
    "brand": "Online Ceramics",
    "dept": "unisex",
    "cat": "apparel",
    "sale": true,
    "price": 44.0,
    "compare": 68.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_47525ab6-9492-4602-86de-844164a3d6ad.jpg?width=600"
  },
  {
    "title": "Online Ceramics Back By Popular Demand Tee",
    "brand": "Online Ceramics",
    "dept": "unisex",
    "cat": "apparel",
    "sale": true,
    "price": 44.0,
    "compare": 68.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_47199a51-0cfb-45b2-a654-318e57cba80e.jpg?width=600"
  },
  {
    "title": "Butter Goods Stars Polo Polo S/S Shirt",
    "brand": "Butter Goods",
    "dept": "unisex",
    "cat": "apparel",
    "sale": true,
    "price": 69.0,
    "compare": 102.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/9_3c9083b8-d99b-412d-b16f-db3cd2bfb1f2.jpg?width=600"
  },
  {
    "title": "Butter Goods Relaxed Denim Jeans",
    "brand": "Butter Goods",
    "dept": "unisex",
    "cat": "apparel",
    "sale": true,
    "price": 74.0,
    "compare": 110.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/39_d1b1bab4-d53b-438e-a397-7ca20acdfa9a.jpg?width=600"
  },
  {
    "title": "Full Court Press NBA Japan Games '92 Longslee\u2026",
    "brand": "Full Court Press",
    "dept": "unisex",
    "cat": "apparel",
    "sale": true,
    "price": 39.0,
    "compare": 55.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/FCP_FIX.jpg?width=600"
  },
  {
    "title": "Full Court Press Terror Squad Vs. Roc-A-Fella\u2026",
    "brand": "Full Court Press",
    "dept": "unisex",
    "cat": "apparel",
    "sale": true,
    "price": 34.0,
    "compare": 45.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_7448bfbc-a1b4-41fc-bbaa-432e863c86fe.jpg?width=600"
  },
  {
    "title": "Converse Unisex Run Star Crush Ox",
    "brand": "Converse",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 130.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_ade29946-d903-4f46-b906-b99e221f094a.jpg?width=600"
  },
  {
    "title": "Converse Unisex Run Star Crush Ox",
    "brand": "Converse",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 130.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_aac3fedf-8fd4-42ea-9201-9aa42e2ba386.jpg?width=600"
  },
  {
    "title": "Salomon XT-4 OG",
    "brand": "Salomon",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 200.0,
    "compare": 190.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/Salomon.jpg?width=600"
  },
  {
    "title": "Hoka x BEAMS Bondi 7",
    "brand": "Hoka",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 170.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_b8a60536-44df-4d08-ba27-c676123ce995.jpg?width=600"
  },
  {
    "title": "Hoka x BEAMS Bondi 7",
    "brand": "Hoka",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 170.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_0f93bd87-cb7d-407a-9f34-3b47903a5131.jpg?width=600"
  },
  {
    "title": "Dr. Martens Unisex Lowell Stud - Analine",
    "brand": "Dr. Martens",
    "dept": "unisex",
    "cat": "shoes",
    "sale": false,
    "price": 190.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_390f7e90-66ad-439a-962b-0915a83b9ef4.jpg?width=600"
  },
  {
    "title": "Karhu Unisex Fusion 2.0 \"Northern Lights\"",
    "brand": "Karhu",
    "dept": "unisex",
    "cat": "shoes",
    "sale": true,
    "price": 54.0,
    "compare": 150.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/Fusion_3be901a9-2ae1-4c81-b1e3-3a7ad90f06e6.jpg?width=600"
  },
  {
    "title": "Sporty & Rich Women's Wellness 94 Rugby Tee",
    "brand": "Sporty & Rich",
    "dept": "women",
    "cat": "apparel",
    "sale": true,
    "price": 49.0,
    "compare": 95.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_5d34d70f-89a1-4446-902b-39f0fd8f24cf.jpg?width=600"
  },
  {
    "title": "Sporty & Rich Women's Crown Tennis Disco Short",
    "brand": "Sporty & Rich",
    "dept": "women",
    "cat": "apparel",
    "sale": true,
    "price": 59.0,
    "compare": 105.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_eba3b49d-af22-466a-9b80-47e47115bee4.jpg?width=600"
  },
  {
    "title": "Sporty & Rich Women's SRC Terry Polo",
    "brand": "Sporty & Rich",
    "dept": "women",
    "cat": "apparel",
    "sale": true,
    "price": 74.0,
    "compare": 160.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/TerryPolo.jpg?width=600"
  },
  {
    "title": "Sporty & Rich Women's SRC Ribbed Trousers",
    "brand": "Sporty & Rich",
    "dept": "women",
    "cat": "apparel",
    "sale": true,
    "price": 74.0,
    "compare": 170.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/RibbedTrouser.jpg?width=600"
  },
  {
    "title": "Sporty & Rich Women's Bold Health Biker Short",
    "brand": "Sporty & Rich",
    "dept": "women",
    "cat": "apparel",
    "sale": true,
    "price": 44.0,
    "compare": 95.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/BoldHealthBikerShortBlack.jpg?width=600"
  },
  {
    "title": "Sporty & Rich Women's Beverly Hills Horizon S\u2026",
    "brand": "Sporty & Rich",
    "dept": "women",
    "cat": "apparel",
    "sale": true,
    "price": 49.0,
    "compare": 95.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/BeverlyHillsGrayShort.jpg?width=600"
  },
  {
    "title": "Adidas Women's Samba OG",
    "brand": "Adidas",
    "dept": "women",
    "cat": "shoes",
    "sale": false,
    "price": 110.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_df702cd4-fffb-4c9b-9117-82db8e3e3b50.jpg?width=600"
  },
  {
    "title": "ASICS Women's Gel-Kayano 14",
    "brand": "ASICS",
    "dept": "women",
    "cat": "shoes",
    "sale": false,
    "price": 165.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_c2b9b335-8b3b-4e0f-84ee-89b16b11aa92.jpg?width=600"
  },
  {
    "title": "Adidas Women's Taekwondo MEI Shoes",
    "brand": "Adidas",
    "dept": "women",
    "cat": "shoes",
    "sale": false,
    "price": 110.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_01a5c929-b241-4c6c-87aa-48a323a01ecf.jpg?width=600"
  },
  {
    "title": "ASICS Women's GEL-DS TRAINER SP",
    "brand": "ASICS",
    "dept": "women",
    "cat": "shoes",
    "sale": false,
    "price": 120.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_10e91920-3555-498c-b492-4b5ea88b69ce.jpg?width=600"
  },
  {
    "title": "ASICS Women's GEL-DS TRAINER SP",
    "brand": "ASICS",
    "dept": "women",
    "cat": "shoes",
    "sale": false,
    "price": 120.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_0c66698c-0f7f-4623-ae1f-6f2a49deabd2.jpg?width=600"
  },
  {
    "title": "Salomon Women's XT-6 GTX",
    "brand": "Salomon",
    "dept": "women",
    "cat": "shoes",
    "sale": false,
    "price": 200.0,
    "compare": null,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_0ef0bac2-37d2-4d6c-a5af-217e5151edd7.jpg?width=600"
  },
  {
    "title": "Nike Women's Air Max 95 \"Burgundy Ash\"",
    "brand": "Nike",
    "dept": "women",
    "cat": "shoes",
    "sale": true,
    "price": 129.0,
    "compare": 190.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/19_8c0a0801-38cd-42a1-bbef-9c2d2d0285d8.jpg?width=600"
  },
  {
    "title": "Birkenstock Women's Boston Suede Leather - Na\u2026",
    "brand": "Birkenstock",
    "dept": "women",
    "cat": "shoes",
    "sale": true,
    "price": 119.0,
    "compare": 170.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_a7cb6026-a3b6-43eb-a9c4-0629fface32f.jpg?width=600"
  },
  {
    "title": "Birkenstock Women's Arizona Leather - Narrow",
    "brand": "Birkenstock",
    "dept": "women",
    "cat": "shoes",
    "sale": true,
    "price": 119.0,
    "compare": 170.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_3eefd07d-5820-44c0-bf49-eb18ae6dc7a4.jpg?width=600"
  },
  {
    "title": "Birkenstock Women's Arizona Leather - Narrow",
    "brand": "Birkenstock",
    "dept": "women",
    "cat": "shoes",
    "sale": true,
    "price": 119.0,
    "compare": 170.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_785eec71-f4bf-4d14-872a-86c98ea4ba05.jpg?width=600"
  },
  {
    "title": "Adidas Women's Handball Spezial",
    "brand": "Adidas",
    "dept": "women",
    "cat": "shoes",
    "sale": true,
    "price": 94.0,
    "compare": 130.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_55275b28-42b0-428d-9751-d799e09e2046.jpg?width=600"
  },
  {
    "title": "Adidas Women's Samba OG",
    "brand": "Adidas",
    "dept": "women",
    "cat": "shoes",
    "sale": true,
    "price": 84.0,
    "compare": 120.0,
    "img": "https://cdn.shopify.com/s/files/1/2729/9188/files/1_57016079-2729-4855-b39e-2e489eccf045.jpg?width=600"
  }
];

  /* Stable ids so every surface (PLP, PDP, cart, orders) points at the
     same product. Port note: becomes the Shopify product handle. */
  PRODUCTS.forEach((p, i) => {
    p.id = "p" + i;
  });

  const byId = (id) => PRODUCTS.find((p) => p.id === id) || null;

  const sizesFor = (p) =>
    p.cat === "shoes"
      ? ["8", "9", "10", "11", "12"]
      : p.cat === "apparel"
        ? ["S", "M", "L", "XL"]
        : ["OS"];

  /* Filter by homepage prefs. Unisex items belong to every department. */
  const feed = (hp, limit) => {
    const dept = (hp && hp.department) || "all";
    const cat = (hp && hp.category) || "all";
    const saleOnly = !!(hp && hp.saleOnly);
    const out = PRODUCTS.filter((p) => {
      if (dept !== "all" && p.dept !== dept && p.dept !== "unisex") return false;
      if (cat !== "all" && p.cat !== cat) return false;
      if (saleOnly && !p.sale) return false;
      return true;
    });
    return limit ? out.slice(0, limit) : out;
  };

  const money = (n) => "$" + n.toFixed(2);

  const priceHtml = (p) =>
    p.sale && p.compare
      ? `<span class="price-was">${money(p.compare)}</span> ${money(p.price)}`
      : money(p.price);

  /* Matches the PLP/home .product-card markup exactly */
  const cardHtml = (p) => `
    <a class="product-card" href="product.html?p=${p.id}">
      <div class="product-card__media"><img src="${p.img}" alt="${p.title}" loading="lazy" /></div>
      <div class="product-card__meta">
        <div class="product-card__brand">${p.brand}</div>
        <div class="product-card__title">${p.title}</div>
        <div class="product-card__price">${priceHtml(p)}</div>
      </div>
    </a>`;

  return { PRODUCTS, byId, sizesFor, feed, money, priceHtml, cardHtml };
})();

/* ── Cart + Orders stores ─────────────────────────────────────
   localStorage-backed; every write dispatches august:cart-changed so
   badges/pages stay live. Port note: cart → Shopify Ajax Cart API,
   orders → customer.orders in Liquid. */
window.AugustCart = (() => {
  const CART_KEY = "august_cart";
  const ORDERS_KEY = "august_orders";

  const read = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  };

  const write = (items) => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("august:cart-changed"));
  };

  const items = () => read(CART_KEY);

  const add = (id, size) => {
    const list = items();
    const found = list.find((i) => i.id === id && i.size === size);
    if (found) found.qty += 1;
    else list.push({ id, size, qty: 1 });
    write(list);
  };

  const removeAt = (index) => {
    const list = items();
    list.splice(index, 1);
    write(list);
  };

  const clear = () => write([]);

  const count = () => items().reduce((n, i) => n + i.qty, 0);

  const subtotal = () =>
    items().reduce((sum, i) => {
      const p = window.AugustCatalog.byId(i.id);
      return sum + (p ? p.price * i.qty : 0);
    }, 0);

  const orders = () => read(ORDERS_KEY);

  const placeOrder = () => {
    const list = items();
    if (!list.length) return null;
    const order = {
      no: "AUG-" + (2418 + orders().length),
      date: Date.now(),
      items: list,
      total: subtotal(),
      status: "Processing",
    };
    const all = orders();
    all.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(all));
    clear();
    return order;
  };

  return { items, add, removeAt, clear, count, subtotal, orders, placeOrder };
})();
