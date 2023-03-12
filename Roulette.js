import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  Image,
  Animated,
  Easing,
  Dimensions,
  PanResponder,
  Switch,
  Pressable,
} from "react-native";
import styled from "styled-components/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ReactNativeZoomableView from "@openspacelabs/react-native-zoomable-view/src/ReactNativeZoomableView";
import { Ionicons } from "@expo/vector-icons";
import { Foundation } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { TestIds, useRewardedAd } from "react-native-google-mobile-ads";
const rewardeAdUnitId = __DEV__
  ? TestIds.REWARDED
  : "ca-app-pub-8647279125417942/4426619536";
const WindowWidth = Dimensions.get("window").width;
const WindowHeight = Dimensions.get("window").height;
const STORAGE_KEY_COIN = "@my_coin";
const STORAGE_KEY_BEST_COIN = "@my_best_coin";
const battingInfo = [
  { color: "#E4D468", name: "1" },
  { color: "#50A53D", name: "3" },
  { color: "#356BA8", name: "5" },
  { color: "#AD5FA3", name: "10" },
  { color: "#C64028", name: "20" },
];
const Roulette = () => {
  const [touchedIdx, setTouchedIdx] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const spinValue = useRef(new Animated.Value(0)).current;
  const [currentDeg, setCurrentDeg] = useState(0);
  const [battingList, setBattingList] = useState([0, 0, 0, 0, 0]);
  const [coinList, setCoinList] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const refCoinList = useRef([0, 0, 0, 0, 0, 0, 0, 0]);
  const refBattingList = useRef([0, 0, 0, 0, 0]);
  const batIdx = useRef(null);
  const coinIdx = useRef(null);
  const [batPrize, setBatPrize] = useState(null);
  const [spinSound, setSpinSound] = useState();
  const [bestCoin, setBestCoin] = useState(0);
  const [spinSlowSound, setSpinSlowSound] = useState();
  const [bottomViewLock, setBottomViewLock] = useState(false);
  const refDropSound = useRef();
  const refGetMoneySound = useRef();
  const rouletteEnable = useRef(true);
  const {
    isLoaded: rewardIsLoaded,
    isClosed: rewardIsClosed,
    load: rewardLoad,
    show: rewardShow,
  } = useRewardedAd(rewardeAdUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const spinFunc = (seed) => {
    const speenNum = 2;
    var degSeed = Number(seed.toFixed(3));
    var spinToValue = Number((currentDeg + degSeed + speenNum).toFixed(3));
    var tempSpinToValue = Number((spinToValue % 1).toFixed(3));
    if (
      tempSpinToValue == 0.034 ||
      tempSpinToValue == 0.112 ||
      tempSpinToValue == 0.196 ||
      tempSpinToValue == 0.238 ||
      tempSpinToValue == 0.284 ||
      tempSpinToValue == 0.324 ||
      tempSpinToValue == 0.4 ||
      tempSpinToValue == 0.59 ||
      tempSpinToValue == 0.624 ||
      tempSpinToValue == 0.75 ||
      tempSpinToValue == 0.838 ||
      tempSpinToValue == 0.914 ||
      tempSpinToValue == 0.952 ||
      tempSpinToValue == 0.992
    ) {
      console.log("spinToValue", spinToValue);
      spinToValue += 0.002;
    }
    Animated.timing(spinValue, {
      toValue: spinToValue,
      duration: 8000,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
      useNativeDriver: true, // To make use of native driver for performance
    }).start();
    setCurrentDeg(spinToValue);
    console.log("spinToValue", spinToValue);
    setTimeout(() => {
      spinResult(Number((spinToValue % 1).toFixed(3)));
      rouletteEnable.current = true;
    }, 6500);

    spinSoundPlay();
    const slowTime = 0.4; //작을수록 늦게 속도가 늦쳐진다.
    var onMute = true;
    spinValue.addListener(({ value }) => {
      // console.log(value);
      if (value > spinToValue - slowTime && onMute) {
        spinSoundMute();
        spinSlowSoundPlay();
        onMute = false;
      }
    });
  };

  const spinResult = (value) => {
    var result = null;
    console.log("getDeg", value);
    if (
      value <= 0.032 ||
      (0.072 <= value && value <= 0.11) ||
      (0.152 <= value && value <= 0.194) ||
      (0.24 <= value && value <= 0.282) ||
      (0.326 <= value && value <= 0.366) ||
      (0.402 <= value && value <= 0.442) ||
      (0.478 <= value && value <= 0.516) ||
      (0.55 <= value && value <= 0.588) ||
      (0.626 <= value && value <= 0.666) ||
      (0.706 <= value && value <= 0.748) ||
      (0.79 <= value && value <= 0.836) ||
      (0.916 <= value && value <= 0.95) ||
      0.994 <= value
    ) {
      result = 0; //1
    } else if (
      (0.036 <= value && value <= 0.07) ||
      (0.198 <= value && value <= 0.236) ||
      (0.368 <= value && value <= 0.398) ||
      (0.518 <= value && value <= 0.548) ||
      (0.668 <= value && value <= 0.704) ||
      (0.84 <= value && value <= 0.874) ||
      (0.916 <= value && value <= 0.95)
    ) {
      result = 1; //3
    } else if (
      (0.286 <= value && value <= 0.322) ||
      (0.592 <= value && value <= 0.622) ||
      (0.876 <= value && value <= 0.912) ||
      (0.954 <= value && value <= 0.99)
    ) {
      result = 2; //5
    } else if (
      (0.114 <= value && value <= 0.15) ||
      (0.752 <= value && value <= 0.788)
    ) {
      result = 3; //10
    } else if (0.444 <= value && value <= 0.476) {
      result = 4; //20
    } else {
      console.log("degErorr");
    }

    batPrizeFcn(result);
  };
  const batPrizeFcn = (result) => {
    if (refBattingList.current[result] != 0) {
      console.log("당첨!");
      console.log(battingInfo[result].name);
      const prize =
        (Number(battingInfo[result].name) + 1) * refBattingList.current[result];
      setBatPrize(prize);
    } else {
      console.log("꽝");
    }
    refBattingList.current = [0, 0, 0, 0, 0];
    setBattingList([0, 0, 0, 0, 0]);
    storeCoinData();
    setBottomViewLock(false);
  };
  const coinSplit = (index) => {
    var tempList = [...coinList];
    if (coinList[index] != 0) {
      var splitValue = Math.floor(tempList[index] / 2);
      var emptyIdx = tempList.indexOf(0);
      if (emptyIdx == -1) {
        emptyIdx = 7;
      }
      tempList[index] -= splitValue;
      tempList[emptyIdx] += splitValue;
      setCoinList(tempList);
      refCoinList.current = tempList;
      storeCoinData();
    }
  };
  const scaleBattingArr = useRef(
    Array.from({ length: 5 }, (v, i) => new Animated.Value(1))
  ).current;

  const scaleCoinArr = useRef(
    Array.from({ length: 8 }, (v, i) => new Animated.Value(1))
  ).current;
  const positionCoinArr = useRef(
    Array.from({ length: 8 }, (v, i) => new Animated.ValueXY({ x: 0, y: 0 }))
  ).current;
  const scaleCoinBoxArr = useRef(
    Array.from({ length: 8 }, (v, i) => new Animated.Value(1))
  ).current;

  const battingListFcn = (invenIdx) => {
    // console.log("batIdx", batIdx.current);
    // console.log("invenIdx", invenIdx);
    var tempBatList = [...refBattingList.current];
    var tempCoinList = [...refCoinList.current];
    // console.log("battingList", tempBatList);
    // console.log("coinList", tempCoinList);
    tempBatList[batIdx.current] += tempCoinList[invenIdx];
    tempCoinList[invenIdx] = 0;
    refCoinList.current = tempCoinList;
    refBattingList.current = tempBatList;
    setCoinList(tempCoinList);
    setBattingList(tempBatList);
    batIdx.current = null;
  };
  const coinMergeFcn = (invenIdx) => {
    console.log("coinIdx", coinIdx.current);
    console.log("invenIdx", invenIdx);
    var tempCoinList = [...refCoinList.current];
    tempCoinList[coinIdx.current] += tempCoinList[invenIdx];
    tempCoinList[invenIdx] = 0;
    refCoinList.current = tempCoinList;
    setCoinList(tempCoinList);
    coinIdx.current = null;
    storeCoinData();
  };
  const panResponderArr = useRef(
    Array.from({ length: 8 }, (v, index) =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          setTouchedIdx(index);
          // console.log(index);
          // onPressInFcn(index).start();
          scaleCoinArr[index].setValue(1.1);
        },
        onPanResponderMove: (_, { dx, dy }) => {
          positionCoinArr[index].setValue({ x: dx, y: dy });
          //console.log(dx, dy);
          const coinBoxIntv = 67;
          const batBoxIntv = 80;
          const offSetX = (index % 4) * coinBoxIntv;
          const offSetY = Math.floor(index / 4) * coinBoxIntv;
          if (dy < -46 - offSetY) {
            //console.log("battingArea");
            if (
              dy < -63 - offSetY &&
              dy > -143 - offSetY &&
              dx > -15 - offSetX &&
              dx < 25 - offSetX
            ) {
              scaleBattingArr[0].setValue(1.1);
              batIdx.current = 0;
              //console.log("batting 1");
            } else if (
              dy < -63 - offSetY &&
              dy > -143 - offSetY &&
              dx > -15 + batBoxIntv - offSetX &&
              dx < 25 + batBoxIntv - offSetX
            ) {
              scaleBattingArr[1].setValue(1.1);
              batIdx.current = 1;
              //console.log("batting 3");
            } else if (
              dy < -63 - offSetY &&
              dy > -143 - offSetY &&
              dx > -15 + batBoxIntv * 2 - offSetX &&
              dx < 25 + batBoxIntv * 2 - offSetX
            ) {
              scaleBattingArr[2].setValue(1.1);
              batIdx.current = 2;
              //console.log("batting 5");
            } else if (
              dy < -63 - offSetY &&
              dy > -143 - offSetY &&
              dx > -15 + batBoxIntv * 3 - offSetX &&
              dx < 25 + batBoxIntv * 3 - offSetX
            ) {
              scaleBattingArr[3].setValue(1.1);
              batIdx.current = 3;
              //console.log("batting 10");
            } else if (
              dy < -63 - offSetY &&
              dy > -143 - offSetY &&
              dx > -15 + batBoxIntv * 4 - offSetX &&
              dx < 25 + batBoxIntv * 4 - offSetX
            ) {
              scaleBattingArr[4].setValue(1.1);
              batIdx.current = 4;
              //console.log("batting 20");
            } else {
              if (batIdx.current != null)
                scaleBattingArr[batIdx.current].setValue(1);
              // scaleBattingArr.map((item, index) => {
              //   item.setValue(1);
              // });
              batIdx.current = null;
            }
          } else {
            //console.log("coinViewArea");
            if (
              dy < 20 - offSetY &&
              dy > -20 - offSetY &&
              dx > -20 - offSetX &&
              dx < 20 - offSetX
            ) {
              // console.log("box1");
              scaleCoinBoxArr[0].setValue(1.1);
              coinIdx.current = 0;
            } else if (
              dy < 20 - offSetY &&
              dy > -20 - offSetY &&
              dx > -20 + coinBoxIntv - offSetX &&
              dx < 20 + coinBoxIntv - offSetX
            ) {
              //console.log("box2");
              scaleCoinBoxArr[1].setValue(1.1);
              coinIdx.current = 1;
            } else if (
              dy < 20 - offSetY &&
              dy > -20 - offSetY &&
              dx > -20 + coinBoxIntv * 2 - offSetX &&
              dx < 20 + coinBoxIntv * 2 - offSetX
            ) {
              //console.log("box3");
              scaleCoinBoxArr[2].setValue(1.1);
              coinIdx.current = 2;
            } else if (
              dy < 20 - offSetY &&
              dy > -20 - offSetY &&
              dx > -20 + coinBoxIntv * 3 - offSetX &&
              dx < 20 + coinBoxIntv * 3 - offSetX
            ) {
              //console.log("box4");
              scaleCoinBoxArr[3].setValue(1.1);
              coinIdx.current = 3;
            } else if (
              dy < 20 + coinBoxIntv - offSetY &&
              dy > -20 + coinBoxIntv - offSetY &&
              dx > -20 - offSetX &&
              dx < 20 - offSetX
            ) {
              //console.log("box5");
              scaleCoinBoxArr[4].setValue(1.1);
              coinIdx.current = 4;
            } else if (
              dy < 20 + coinBoxIntv - offSetY &&
              dy > -20 + coinBoxIntv - offSetY &&
              dx > -20 + coinBoxIntv - offSetX &&
              dx < 20 + coinBoxIntv - offSetX
            ) {
              //console.log("box6");
              scaleCoinBoxArr[5].setValue(1.1);
              coinIdx.current = 5;
            } else if (
              dy < 20 + coinBoxIntv - offSetY &&
              dy > -20 + coinBoxIntv - offSetY &&
              dx > -20 + coinBoxIntv * 2 - offSetX &&
              dx < 20 + coinBoxIntv * 2 - offSetX
            ) {
              //console.log("box7");
              scaleCoinBoxArr[6].setValue(1.1);
              coinIdx.current = 6;
            } else if (
              dy < 20 + coinBoxIntv - offSetY &&
              dy > -20 + coinBoxIntv - offSetY &&
              dx > -20 + coinBoxIntv * 3 - offSetX &&
              dx < 20 + coinBoxIntv * 3 - offSetX
            ) {
              //console.log("box8");
              scaleCoinBoxArr[7].setValue(1.1);
              coinIdx.current = 7;
            } else {
              if (coinIdx.current != null)
                scaleCoinBoxArr[coinIdx.current].setValue(1);
              coinIdx.current = null;
            }
          }
        },
        onPanResponderRelease: () => {
          scaleCoinArr[index].setValue(1);

          positionCoinArr[index].setValue({ x: 0, y: 0 });
          if (batIdx.current != null) {
            scaleBattingArr[batIdx.current].setValue(1);
            battingListFcn(index);
            refDropSoundPlay();
          }
          if (coinIdx.current != null) {
            scaleCoinBoxArr[coinIdx.current].setValue(1);
            if (coinIdx.current != index) coinMergeFcn(index);
            refDropSoundPlay();
          }
        },
      })
    )
  ).current;

  const removeBatting = (index) => {
    //console.log("hello", index);
    var tempBatList = [...battingList];
    var tempCoinList = [...coinList];
    tempCoinList[0] += tempBatList[index];
    tempBatList[index] = 0;
    refCoinList.current = tempCoinList;
    refBattingList.current = tempBatList;
    setCoinList(tempCoinList);
    setBattingList(tempBatList);
  };

  const getPrize = () => {
    console.log("givePrize");
    refGetMoneySoundPlay();
    var tempCoinList = [...coinList];
    tempCoinList[0] += batPrize;
    setBatPrize(null);
    setCoinList(tempCoinList);
    refCoinList.current = tempCoinList;
    storeCoinData();
    checkBest();
  };
  const checkBest = () => {
    const coinSum = refCoinList.current.reduce(function add(sum, currValue) {
      return sum + currValue;
    }, 0);
    console.log("coinSum", coinSum);
    console.log("bestCoin", bestCoin);

    if (coinSum > bestCoin) {
      storeBestCoinData(coinSum);
      setBestCoin(coinSum);
      console.log("storeBestCoin");
    }
  };
  const rouletteSoundLoad = async () => {
    console.log("Loading Sound");
    var { sound } = await Audio.Sound.createAsync(
      require("./Assets/Sounds/spin.mp3")
    );
    setSpinSound(sound);

    var { sound } = await Audio.Sound.createAsync(
      require("./Assets/Sounds/spinSlow.mp3")
    );
    setSpinSlowSound(sound);

    var { sound } = await Audio.Sound.createAsync(
      require("./Assets/Sounds/drop.mp3")
    );
    refDropSound.current = sound;

    var { sound } = await Audio.Sound.createAsync(
      require("./Assets/Sounds/getMoney.mp3")
    );
    refGetMoneySound.current = sound;
  };

  const spinSoundPlay = async () => {
    if (spinSound) {
      await spinSound.setIsMutedAsync(false);
      await spinSound.setIsLoopingAsync(true);
      await spinSound.replayAsync();
    }
  };
  const spinSoundMute = async () => {
    if (spinSound) {
      await spinSound.setIsMutedAsync(true);
    }
  };
  const spinSlowSoundPlay = async () => {
    if (spinSlowSound) {
      await spinSlowSound.replayAsync();
    }
  };
  const refDropSoundPlay = async () => {
    if (refDropSound.current) {
      console.log("refDropSound");
      await refDropSound.current.replayAsync();
    }
  };
  const refGetMoneySoundPlay = async () => {
    if (refGetMoneySound.current) {
      await refGetMoneySound.current.replayAsync();
    }
  };
  const storeCoinData = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY_COIN,
        JSON.stringify(refCoinList.current)
      );
    } catch (e) {
      alert(e);
    }
  };
  const getCoinData = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY_COIN);
      if (value == null) {
        const tempList = [1000, 0, 0, 0, 0, 0, 0, 0];
        setCoinList(tempList);
        refCoinList.current = tempList;
      } else {
        setCoinList(JSON.parse(value));
        refCoinList.current = JSON.parse(value);
      }
    } catch (e) {
      alert(e);
    }
  };
  const storeBestCoinData = async (value) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_BEST_COIN, JSON.stringify(value));
    } catch (e) {
      alert(e);
    }
  };
  const getBestCoinData = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY_BEST_COIN);
      if (value == null) {
        setBestCoin(1000);
      } else {
        setBestCoin(JSON.parse(value));
      }
    } catch (e) {
      alert(e);
    }
  };
  useEffect(() => {
    if (rewardIsClosed) {
      console.log("RewardClose!!");
      setBatPrize(100);

      rewardLoad();
    }
  }, [rewardIsClosed]);
  useEffect(() => {
    rouletteSoundLoad();
    getCoinData();
    getBestCoinData();
  }, []);
  useEffect(() => {
    rewardLoad();
  }, [rewardLoad]);

  useEffect(() => {
    console.log("rewardIsLoaded", rewardIsLoaded);
  }, [rewardIsLoaded]);
  return (
    <WindowContainer>
      <HeaderView>
        <Text style={{ fontSize: 12, color: "white" }}>{"현재자산"}</Text>
        <CoinView style={{ paddingHorizontal: 15 }}>
          <Text style={{ fontSize: 25, fontWeight: "bold" }}>
            {coinList
              .reduce(function add(sum, currValue) {
                return sum + currValue;
              }, 0)
              .toLocaleString()}
          </Text>
        </CoinView>
      </HeaderView>
      <GameScreenView>
        <BestCoinScoreView>
          <Text
            style={{
              color: "white",
              fontSize: 12,
            }}
          >{`최고자산`}</Text>
          <Text
            style={{
              color: "white",
              fontSize: 11,
            }}
          >
            {bestCoin.toLocaleString()}
          </Text>
        </BestCoinScoreView>
        <ReactNativeZoomableView
          maxZoom={3.5}
          minZoom={1}
          initialZoom={1}
          bindToBorders={true}
        >
          <RouletteView
            style={{
              transform: [{ rotateZ: spin }],
            }}
          >
            <Image
              style={{
                height: "90%",
                width: "90%",
                resizeMode: "contain",
              }}
              source={require("./Assets/Images/Roulette.png")}
            />
          </RouletteView>

          <Image
            style={{
              height: 40,
              width: 40,
              position: "absolute",
              alignSelf: "center",
              top: 5,
            }}
            source={require("./Assets/Images/Pin.png")}
          />
        </ReactNativeZoomableView>
      </GameScreenView>
      <RouletteStartView>
        <RouletteBtn
          onPress={() => {
            if (!rewardIsLoaded) {
              rewardLoad();
              console.log("hello");
            }

            if (rouletteEnable.current == true) {
              setBottomViewLock(true);
              spinFunc(Math.floor(Math.random() / 0.002) * 0.002);
            }

            rouletteEnable.current = false;
          }}
        >
          <Text style={{ fontSize: 20, color: "white" }}>{"돌리기"}</Text>
        </RouletteBtn>
        <WorkBtn onPress={rewardIsLoaded ? rewardShow : null}>
          {rewardIsLoaded ? (
            <>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {"노동하기"}
              </Text>
              <Foundation
                style={{ top: -2 }}
                name="play-video"
                size={30}
                color="black"
              />
            </>
          ) : (
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>{"일없다"}</Text>
          )}
        </WorkBtn>
      </RouletteStartView>
      <BattingView>
        {battingInfo.map((item, index) => {
          return (
            <BattingBox
              onPress={() => {
                removeBatting(index);
              }}
              key={index}
              style={{
                backgroundColor: item.color,
                transform: [{ scale: scaleBattingArr[index] }],
              }}
            >
              {battingList[index] != 0 ? (
                <>
                  <Image
                    style={{
                      height: "90%",
                      width: "90%",
                      resizeMode: "contain",
                    }}
                    source={require("./Assets/Images/scrap.png")}
                  />
                  <InventoryText>{`x${battingList[
                    index
                  ].toLocaleString()}`}</InventoryText>
                </>
              ) : (
                <BattingBoxText>{item.name}</BattingBoxText>
              )}
            </BattingBox>
          );
        })}
      </BattingView>
      <BottomView>
        <Inventory>
          <ToggleView
            style={{ position: "absolute", left: 0, top: -3, zIndex: 100 }}
          >
            <Ionicons
              name="hand-right-sharp"
              size={24}
              color={isEnabled ? "white" : "yellow"}
            />
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isEnabled ? "#3795BD" : "#81b0ff"}
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
            <Ionicons
              name="cut"
              size={24}
              color={isEnabled ? "yellow" : "white"}
            />
          </ToggleView>
          {coinList.map((item, index) => {
            return (
              <InventoryBox
                style={{
                  transform: [{ scale: scaleCoinBoxArr[index] }],
                  zIndex: touchedIdx == index ? 100 : 0,
                }}
                key={index}
              >
                {item != 0 ? (
                  isEnabled ? (
                    <CoinObjectTouchableView
                      onPress={() => {
                        coinSplit(index);
                      }}
                    >
                      <Image
                        style={{
                          height: "90%",
                          width: "90%",
                          resizeMode: "contain",
                        }}
                        source={require("./Assets/Images/scrap.png")}
                      />
                      <InventoryText>{`x${item.toLocaleString()}`}</InventoryText>
                    </CoinObjectTouchableView>
                  ) : (
                    <CoinObjectView
                      {...panResponderArr[index].panHandlers}
                      style={{
                        transform: [
                          ...positionCoinArr[index].getTranslateTransform(),
                          { scale: scaleCoinArr[index] },
                        ],
                      }}
                    >
                      <Image
                        style={{
                          height: "90%",
                          width: "90%",
                          resizeMode: "contain",
                        }}
                        source={require("./Assets/Images/scrap.png")}
                      />
                      <InventoryText>{`x${item.toLocaleString()}`}</InventoryText>
                    </CoinObjectView>
                  )
                ) : null}
              </InventoryBox>
            );
          })}
        </Inventory>
        <PrizeView>
          <PrizeTextView>
            <Text style={{ color: "white", fontSize: 20 }}>{"상금"}</Text>
          </PrizeTextView>
          <PrizeCoin
            onPress={() => {
              if (batPrize != null) getPrize();
            }}
          >
            {batPrize != null ? (
              <>
                <Image
                  style={{
                    height: "90%",
                    width: "90%",
                    resizeMode: "contain",
                  }}
                  source={require("./Assets/Images/scrap.png")}
                />
                <PrizeCoinText>{`x${batPrize}`}</PrizeCoinText>
              </>
            ) : null}
          </PrizeCoin>
        </PrizeView>
      </BottomView>
      {bottomViewLock ? (
        <LockBox>
          <Foundation name="lock" size={50} color="black" />
        </LockBox>
      ) : null}
    </WindowContainer>
  );
};
export default Roulette;

const WindowContainer = styled.View`
  flex: 1;
  background-color: #322e2a;
`;
const HeaderView = styled.View`
  flex: 0.1;
  background-color: #322e2a;
  align-items: center;
  justify-content: center;
`;
const BestCoinScoreView = styled.View`
  position: absolute;
  width: 100px;
  border-radius: 5px;
  z-index: 10;
  background-color: grey;
  right: 10px;
  top: 15px;
  align-items: center;
`;
const CoinView = styled.View`
  //width: 200px;
  height: 50px;
  border-radius: 20px;
  border-width: 3.5px;
  background-color: white;
  align-items: center;
  justify-content: center;
`;
const GameScreenView = styled.View`
  flex: 0.5;
  background-color: #56524e;
  justify-content: center;
`;
const RouletteView = styled(Animated.createAnimatedComponent(View))`
  //background-color: orange;
  width: 400px;
  height: 400px;
  align-items: center;
  justify-content: center;
`;
const BattingView = styled.View`
  background-color: #56524e;
  flex: 0.1;
  padding-bottom: 5px;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  border-color: #322e2a;
  border-width: 5px;
`;
const BattingBox = styled(Animated.createAnimatedComponent(Pressable))`
  width: 65px;
  height: 65px;
  border-width: 5px;
  align-items: center;
  justify-content: center;
`;
const BattingBoxText = styled.Text`
  font-size: 30px;
  font-weight: bold;
`;

const BottomView = styled.View`
  flex: 0.22;
  flex-direction: row;
`;
const Inventory = styled.View`
  background-color: #322e2a;
  flex: 0.7;
  flex-direction: row;
  flex-wrap: wrap;
  border-color: #322e2a;
  border-width: 5px;
  justify-content: center;
  align-content: flex-end;
  margin-bottom: 8px;
`;
const InventoryBox = styled(Animated.createAnimatedComponent(View))`
  background-color: #56524e;
  width: 61px;
  height: 61px;
  margin: 3px;
  align-items: center;
`;
const CoinObjectView = styled(Animated.createAnimatedComponent(View))`
  width: 61px;
  height: 61px;
  align-items: center;
`;
const CoinObjectTouchableView = styled.TouchableOpacity`
  width: 61px;
  height: 61px;
  align-items: center;
`;
const InventoryText = styled.Text`
  color: white;
  font-size: 12px;
  position: absolute;
  bottom: 1px;
  right: 3px;
`;
const PrizeView = styled.View`
  background-color: #56524e;
  flex: 0.3;
  border-color: #322e2a;
  border-width: 3px;
  margin-right: 5px;
  margin-bottom: 5px;
  z-index: -10;
`;
const PrizeTextView = styled.View`
  background-color: #56524e;
  flex: 0.3;
  border-color: #322e2a;
  border-bottom-width: 5px;
  align-items: center;
  justify-content: center;
`;
const PrizeCoin = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  background-color: #56524e;
  flex: 0.7;
`;
const PrizeCoinText = styled.Text`
  color: white;
  font-size: 20px;
  position: absolute;
  bottom: 1px;
  right: 3px;
`;
const RouletteStartView = styled.View`
  background-color: #322e2a;
  flex: 0.08;
  justify-content: center;
`;
const RouletteBtn = styled.TouchableOpacity`
  width: 80px;
  height: 50px;
  border-radius: 10px;
  border-color: black;
  border-width: 5px;
  align-self: center;
  background-color: #56524e;
  align-items: center;
  justify-content: center;
`;
const ToggleView = styled.View`
  flex-direction: row;
`;
const WorkBtn = styled.TouchableOpacity`
  width: 90px;
  height: 60px;
  background-color: grey;
  position: absolute;
  right: 10px;
  bottom: 50px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
`;
const LockBox = styled.View`
  background-color: red;
  opacity: 0.5;
  position: absolute;
  width: 400px;
  height: 250px;
  z-index: 3;
  justify-content: center;
  align-items: center;
  align-self: center;
  bottom: 12px;
`;
