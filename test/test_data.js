const org = [
  {
    name: "Facebook",
    url: "https://www.facebook.com",
    description:
      "A social media site that allows users to interact and communicate with each other",
    handle: "twitter/facebook",
    sector: "Social Media",
    region: "North America",
    logoId: "",
    bannerId: "",
  },
  {
    name: "Google",
    url: "https://www.google.com",
    description: "A specialised search engine for anything you can imagine",
    handle: "twitter/google",
    sector: "Search Engine",
    region: "North America",
    logoId: "",
    bannerId: "",
  },
  {
    name: "Microsoft",
    url: "https://www.microsoft.com",
    description:
      "A powerful Operating System that powers 50% of world's computers",
    handle: "twitter/microsoft",
    sector: "Social Media",
    region: "North America",
    logoId: "",
    bannerId: "",
  },
  {
    name: "Apple",
    url: "https://www.apple.com",
    description:
      "A hardware/software company creating an ecosystem of technologies",
    handle: "twitter/apple",
    sector: "Social Media",
    region: "North America",
    logoId: "",
    bannerId: "",
  },
];

const project = {
  orgId: "or-Yt8qSo",
  name: "test4",
  description: "This is a description",
  coordinates: [70, 60],
  projectImpacts: [
    {
      id: "ip-Ggxuxm",
      description: "impact1",
    },
    {
      id: "ip-F98o98",
      description: "impact2",
    },
    {
      id: "ip-UfsBPj",
      description: "impa",
    },
    {
      id: "",
      description: "impa",
    },
  ],
  outcomesDesired: [
    {
      id: "oc-NcKlfC",
      description: "outcome1",
    },
    {
      id: "oc-G2iQp9",
      description: "outcome2",
    },
    {
      id: "oc-ZdimJn",
      description: "outcome3",
    },
  ],
  startDate: "",
  endDate: "2021-04-08",
  beneficiaries: [
    {
      name: "evwv2qkv",
      lifeChange: [
        {
          id: "lc-QXCSXw",
          description: "life change 1",
        },
        {
          id: "lc-U0DCzv",
          description: "life change 2",
        },
        {
          id: "lc-Givs1N",
          description: "life change 3",
        },
      ],
      demographics: [
        {
          name: "age",
          operator: ">",
          value: "10",
        },
        {
          name: "age",
          operator: ">",
          value: "10",
        },
      ],
    },
    {
      name: "",
      lifeChange: [
        {
          id: "lc-QXCSXw",
          description: "life change 1",
        },
        {
          id: "lc-U0DCzv",
          description: "life change 2",
        },
        {
          id: "lc-Givs1N",
          description: "life change 3",
        },
      ],
      demographics: [
        {
          name: "age",
          operator: ">",
          value: "10",
        },
        {
          name: "age",
          operator: ">",
          value: "10",
        },
      ],
    },
    {
      name: "4v2w4t2",
      lifeChange: [
        {
          id: "lc-QXCSXw",
          description: "life change 1",
        },
        {
          id: "lc-U0DCzv",
          description: "life change 2",
        },
        {
          id: "lc-Givs1N",
          description: "life change 3",
        },
      ],
      demographics: [
        {
          name: "age",
          operator: ">",
          value: "10",
        },
        {
          name: "age",
          operator: ">",
          value: "10",
        },
      ],
    },
  ],
  logoId: "",
  bannerId: "",
};

const updateOrgData = {
  name: "Apple",
  url: "https://www.apple.com",
  description:
    "A hardware/software company creating an ecosystem of technologies",
  handle: "twitter/apple",
  sector: "Social Media",
  region: "North America",
};

module.exports = {
  org,
  project,
  updateOrgData,
};
