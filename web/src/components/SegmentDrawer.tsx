import React, { useContext, useState } from "react";
import { getCookieConsentValue } from "react-cookie-consent";
import { useDropzone } from "react-dropzone";
import * as ReactGA from "react-ga4";
import Animate from "./hooks/Animation";
import AppContext from "./hooks/createContext";
import SegmentOptions from "./SegmentOptions";
import Sparkle from "./Sparkle";

interface SegmentDrawerProps {
  handleResetState: () => void;
  handleResetInteraction: (flag?: boolean) => void;
  handleUndoInteraction: () => void;
  handleRedoInteraction: () => void;
  handleCreateSticker: () => void;
  handleMagicErase: () => void;
  handleImage: (img?: HTMLImageElement) => void;
  handleMultiMaskMode: () => void;
  userNegClickBool: [
    userNegClickBool: boolean,
    setUserNegClickBool: (e: boolean) => void
  ];
  showGallery: [showGallery: boolean, setShowGallery: (e: boolean) => void];
  hasClicked: boolean;
  handleSelectedImage: (
    data: File | URL,
    options?: { shouldDownload?: boolean; shouldNotFetchAllModel?: boolean }
  ) => void;
}

const SegmentDrawer = ({
  handleResetState,
  handleResetInteraction,
  handleUndoInteraction,
  handleRedoInteraction,
  handleCreateSticker,
  handleMagicErase,
  handleImage,
  handleMultiMaskMode,
  userNegClickBool: [userNegClickBool, setUserNegClickBool],
  showGallery: [showGallery, setShowGallery],
  hasClicked,
  handleSelectedImage,
}: SegmentDrawerProps) => {
  const {
    isModelLoaded: [isModelLoaded, setIsModelLoaded],
    segmentTypes: [segmentTypes, setSegmentTypes],
    isLoading: [isLoading, setIsLoading],
    isErased: [isErased, setIsErased],
    isMultiMaskMode: [isMultiMaskMode, setIsMultiMaskMode],
    stickers: [stickers, setStickers],
    activeSticker: [activeSticker, setActiveSticker],
    didShowAMGAnimation: [didShowAMGAnimation, setDidShowAMGAnimation],
    isAllAnimationDone: [isAllAnimationDone, setIsAllAnimationDone],
    isToolBarUpload: [isToolBarUpload, setIsToolBarUpload],
  } = useContext(AppContext)!;

  const [uploadClick, setUploadClick] = useState<boolean>(true);
  const [visibleClickHover, setVisibleClickHover] = useState<boolean>(false);
  const [visibleBoxHover, setVisibleBoxHover] = useState<boolean>(false);
  const [visibleAllHover, setVisibleAllHover] = useState<boolean>(false);
  const [visibleStickerHover, setVisibleStickerHover] =
    useState<boolean>(false);
  const [isCutOut, setIsCutOut] = useState<boolean>(false);
  const handleStickerClick = (i: number) => {
    setActiveSticker(i);
  };
  const [error, setError] = useState<string>("");
  const [isClickCollapsed, setIsClickCollapsed] = useState(true);
  const [isBoxCollapsed, setIsBoxCollapsed] = useState(true);
  const [isAllCollapsed, setIsAllCollapsed] = useState(true);
  const [isCutOutCollapsed, setIsCutOutCollapsed] = useState(true);
  const [isClickMounted, setIsClickMounted] = useState(false);
  const [isBoxMounted, setIsBoxMounted] = useState(false);
  const [isAllMounted, setIsAllMounted] = useState(false);
  const [isCutOutMounted, setIsCutOutMounted] = useState(false);
  let clickTimeout: string | number | NodeJS.Timeout | undefined,
    boxTimeout: string | number | NodeJS.Timeout | undefined,
    allTimeout: string | number | NodeJS.Timeout | undefined,
    cutOutTimeout: string | number | NodeJS.Timeout | undefined;

  // setIsClickMounted(false)
  // setIsBoxMounted(false)
  // setIsAllMounted(false)
  // setIsCutOutMounted(false)

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
    },
    onDrop: (acceptedFile) => {
      try {
        if (acceptedFile.length === 0) {
          setError("File not accepted! Try again.");
          return;
        }
        if (acceptedFile.length > 1) {
          setError("Too many files! Try again with 1 file.");
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          handleSelectedImage(acceptedFile[0]);
        };
        reader.readAsDataURL(acceptedFile[0]);
      } catch (error) {
        console.log(error);
      }
    },
    maxSize: 50_000_000,
  });

  return (
    <section className="flex-col hidden w-1/5 pt-[6%] overflow-y-auto md:flex lg:w-72">
      <div
        className={`shadow-[0px_0px_15px_5px_#00000024] rounded-xl md:mx-1 lg:mx-5`}
      >
        <div className="p-4 pt-5">
          <div className="flex justify-between p-2 pb-3">
            <span className="leading-3">Tools</span>
          </div>
          {uploadClick && (
            <div className="flex justify-between px-3 py-2 mb-3 cursor-pointer rounded-xl outline outline-gray-200">
              <button
                className="flex"
                onClick={() => {
                  setShowGallery(true);
                  setIsCutOut(false);
                  setIsToolBarUpload(true);
                }}
              >
                <span {...getRootProps()} className="flex text-sm">
                  <input {...getInputProps()} />
                  <img src="static/assets/upload_arrow.svg" className="w-5 mr-1" />
                  Upload
                </span>
              </button>
              <button
                className="flex"
                onClick={() => {
                  // setIsToolBarUpload(false);
                  // setShowGallery(false);
                  // setIsCutOut(false);
                  // setDidShowAMGAnimation(false);
                  // handleResetState();
                  handleCreateSticker();

                }}
              >
                <img src="static/assets/icn-image-gallery.svg" className="w-5 mr-1" />
                <span className="text-sm">Download</span>
              </button>
            </div>
          )}
          <div
            onClick={() => {
              segmentTypes !== "Click" && handleResetInteraction();
              getCookieConsentValue("sa_demo") === "true" &&
                ReactGA.default.send({
                  category: "event",
                  action: "is_click",
                });
              clearTimeout(clickTimeout);
              setSegmentTypes("Click");
              setIsCutOut(false);
              setDidShowAMGAnimation(false);
            }}
            className={`transition-all overflow-hidden pb-2 ${
              segmentTypes !== "Click" &&
              (isClickCollapsed ? "max-h-[40px]" : "max-h-[85px]")
            } px-3 py-2 cursor-pointer rounded-xl ${
              segmentTypes === "Click"
                ? "outline-blue-700 outline outline-[2.5px]"
                : "outline outline-gray-200 "
            } ${isCutOut && "hidden"}`}
            onMouseEnter={() => {
              clearTimeout(clickTimeout);
              clickTimeout = setTimeout(() => {
                setIsClickCollapsed(false);
                setVisibleClickHover(true);
                setIsClickMounted(!isClickMounted);
              }, 700);
            }}
            onMouseLeave={() => {
              setIsClickCollapsed(true);
              setIsBoxCollapsed(true);
              setIsAllCollapsed(true);
              setIsCutOutCollapsed(true);
              // setVisibleClickHover(false);
              clearTimeout(clickTimeout);
              setIsClickMounted(false);
              setIsBoxMounted(false);
              setIsAllMounted(false);
              setIsCutOutMounted(false);
            }}
          >
            <div className="flex">
              <svg
                width="17"
                height="24"
                viewBox="0 0 17 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 mr-2"
              >
                <path
                  d="M9.13635 23.8813C8.53843 24.1683 7.82091 23.9172 7.54586 23.3192L4.93889 17.6509L1.93729 20.0665C1.73399 20.2339 1.48286 20.3296 1.19586 20.3296C0.878697 20.3296 0.574526 20.2036 0.350259 19.9793C0.125992 19.7551 0 19.4509 0 19.1337V1.19586C0 0.878697 0.125992 0.574526 0.350259 0.350259C0.574526 0.125992 0.878697 0 1.19586 0C1.48286 0 1.75791 0.107627 1.96121 0.275047L1.97317 0.263089L15.7136 11.7912C16.2278 12.2217 16.2876 12.9751 15.869 13.4773C15.6897 13.6926 15.4385 13.8361 15.1874 13.8839L11.4085 14.6253L14.0394 20.2817C14.3503 20.8797 14.0633 21.5852 13.4654 21.8603L9.13635 23.8813Z"
                  fill={`${segmentTypes === "Click" ? "#2962D9" : "#000000"}`}
                />
              </svg>
              <span
                className={`font-bold ${
                  segmentTypes === "Click" && "text-blue-600"
                }`}
              >
                Hover & Click
              </span>
            </div>
            {segmentTypes !== "Click" && visibleClickHover && (
              <Animate isMounted={isClickMounted}>
                <p className="my-3 text-[11px] opacity-70">
                  Click an object one or more times. Shift-click to remove
                  regions.
                </p>
              </Animate>
            )}
            {segmentTypes === "Click" && (
              <p className={`my-3 text-[11px] text-blue-700 opacity-70`}>
                Click an object one or more times. Shift-click to remove
                regions.
              </p>
            )}
            <div className="flex justify-between mx-5 my-3">
              <div
                onClick={() => setUserNegClickBool(false)}
                className="flex flex-col items-center"
              >
                <p
                  className={`w-8 h-7 text-3xl leading-7 text-center align-middle rounded-lg mb-1 ${
                    userNegClickBool
                      ? "outline outline-1"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  +
                </p>
                <p
                  className={`text-xs font-bold ${
                    !userNegClickBool && "text-blue-600"
                  }`}
                >
                  Add Mask
                </p>
              </div>

              <div
                onClick={() => setUserNegClickBool(true)}
                className={`flex flex-col items-center ${
                  !hasClicked ? "disabled" : ""
                }`}
              >
                <p
                  className={`w-8 h-7 text-3xl leading-6 text-center align-middle rounded-lg mb-1 ${
                    userNegClickBool
                      ? "bg-blue-600 text-white"
                      : "outline outline-1"
                  }`}
                >
                  -
                </p>
                <p
                  className={`text-xs font-bold ${
                    userNegClickBool && "text-blue-600"
                  }`}
                >
                  Remove Area
                </p>
              </div>
            </div>
            {segmentTypes === "Click" && (
              <SegmentOptions
                handleResetInteraction={handleResetInteraction}
                handleUndoInteraction={handleUndoInteraction}
                handleRedoInteraction={handleRedoInteraction}
                handleCreateSticker={handleCreateSticker}
                handleMagicErase={handleMagicErase}
                handleImage={handleImage}
                hasClicked={hasClicked}
                isCutOut={[isCutOut, setIsCutOut]}
                handleMultiMaskMode={handleMultiMaskMode}
              />
            )}
          </div>

          <div
            onClick={() => {
              segmentTypes !== "Box" && handleResetInteraction(true);
              getCookieConsentValue("sa_demo") === "true" &&
                ReactGA.default.send({
                  category: "event",
                  action: "is_box",
                });
              clearTimeout(boxTimeout);
              setIsMultiMaskMode(false);
              setSegmentTypes("Box");
               (false);
              setDidShowAMGAnimation(false);
            }}
            className={`transition-all overflow-hidden ${
              segmentTypes !== "Box" &&
              (isBoxCollapsed ? "max-h-[40px]" : "max-h-[85px]")
            } my-2 rounded-xl px-4 py-2 cursor-pointer ${
              segmentTypes === "Box"
                ? "outline-blue-700 outline outline-[2.5px]"
                : "outline outline-gray-200"
            } ${isCutOut && "hidden"}`}
            onMouseEnter={() => {
              clearTimeout(boxTimeout);
              boxTimeout = setTimeout(() => {
                setIsBoxCollapsed(false);
                setVisibleBoxHover(true);
                setIsBoxMounted(true);
              }, 700);
            }}
            onMouseLeave={() => {
              setIsClickCollapsed(true);
              setIsBoxCollapsed(true);
              setIsAllCollapsed(true);
              setIsCutOutCollapsed(true);
              // setVisibleBoxHover(false);
              clearTimeout(boxTimeout);
              setIsClickMounted(false);
              setIsBoxMounted(false);
              setIsAllMounted(false);
              setIsCutOutMounted(false);
            }}
          >
            <div className="flex">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.7778 0H2.22222C1.63285 0 1.06762 0.234126 0.650874 0.650874C0.234126 1.06762 0 1.63285 0 2.22222V17.7778C0 18.3671 0.234126 18.9324 0.650874 19.3491C1.06762 19.7659 1.63285 20 2.22222 20H17.7778C18.3671 20 18.9324 19.7659 19.3491 19.3491C19.7659 18.9324 20 18.3671 20 17.7778V2.22222C20 1.63285 19.7659 1.06762 19.3491 0.650874C18.9324 0.234126 18.3671 0 17.7778 0ZM17.7778 17.7778H2.22222V2.22222H17.7778V17.7778ZM15.5556 15.5556H4.44444V4.44444H15.5556V15.5556Z"
                  fill={`${segmentTypes === "Box" ? "#2962D9" : "#000000"}`}
                />
              </svg>

              <span
                className={`pl-2 font-bold ${
                  segmentTypes === "Box" && "text-blue-600"
                }`}
              >
                Box
              </span>
            </div>
            {segmentTypes !== "Box" && visibleBoxHover && (
              <Animate isMounted={isBoxMounted}>
                <p className="my-3 text-xs opacity-70">
                  Roughly draw a box around an object.
                </p>
              </Animate>
            )}
            {segmentTypes === "Box" && (
              <p className={`my-3 text-xs text-blue-700 opacity-70`}>
                Roughly draw a box around an object.
              </p>
            )}
            <div className="flex justify-between mx-5 my-3">
              <div
                onClick={() => setUserNegClickBool(false)}
                className="flex flex-col items-center"
              >
                <p
                  className={`w-8 h-7 text-3xl leading-7 text-center align-middle rounded-lg mb-1 ${
                    userNegClickBool
                      ? "outline outline-1"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  +
                </p>
                <p
                  className={`text-xs font-bold ${
                    !userNegClickBool && "text-blue-600"
                  }`}
                >
                  Add Mask
                </p>
              </div>

              <div
                onClick={() => setUserNegClickBool(true)}
                className={`flex flex-col items-center ${
                  !hasClicked ? "disabled" : ""
                }`}
              >
                <p
                  className={`w-8 h-7 text-3xl leading-6 text-center align-middle rounded-lg mb-1 ${
                    userNegClickBool
                      ? "bg-blue-600 text-white"
                      : "outline outline-1"
                  }`}
                >
                  -
                </p>
                <p
                  className={`text-xs font-bold ${
                    userNegClickBool && "text-blue-600"
                  }`}
                >
                  Remove Area
                </p>
              </div>
            </div>
            {segmentTypes === "Box" && (
              <SegmentOptions
                handleResetInteraction={handleResetInteraction}
                handleUndoInteraction={handleUndoInteraction}
                handleRedoInteraction={handleRedoInteraction}
                handleCreateSticker={handleCreateSticker}
                handleMagicErase={handleMagicErase}
                handleImage={handleImage}
                hasClicked={hasClicked}
                isCutOut={[isCutOut, setIsCutOut]}
                handleMultiMaskMode={handleMultiMaskMode}
              />
            )}
          </div>

        
        </div>
      </div>
    </section>
  );
};

export default SegmentDrawer;
